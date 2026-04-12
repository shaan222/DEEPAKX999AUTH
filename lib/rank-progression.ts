/**
 * Rank Progression System
 * Automatically promotes users to higher ranks based on their achievements
 */

import { adminDb } from './firebase-admin';
import { ClientRank, RankSubTier, RANK_CONFIG, RANK_PROGRESSION_CRITERIA, RankProgressionCriteria } from './types';

export interface UserStats {
  invites: number;
  clients: number;
  subscriptions: number;
}

// Re-export for backward compatibility
export type { RankProgressionCriteria };

/**
 * Get user statistics for rank progression
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // Count invite codes created by this user
  const inviteCodesSnapshot = await adminDb
    .collection('inviteCodes')
    .where('createdBy', '==', userId)
    .get();
  
  const invites = inviteCodesSnapshot.size;

  // Count licenses/clients created by this user
  const licensesSnapshot = await adminDb
    .collection('licenses')
    .where('userId', '==', userId)
    .get();
  
  const clients = licensesSnapshot.size;

  // Count paid subscriptions (pro or advance tier)
  // For now, we count 1 if they currently have pro/advance subscription
  // In the future, you could track subscription history to count all past subscriptions
  const userDoc = await adminDb.collection('users').doc(userId).get();
  const userData = userDoc.data();
  
  let subscriptions = 0;
  if (userData?.subscription) {
    const subscription = userData.subscription;
    // Count current active subscription
    if (subscription.isActive && (subscription.tier === 'pro' || subscription.tier === 'advance')) {
      subscriptions = 1;
      // If subscription has been active for multiple periods, you could count more
      // For now, each active pro/advance subscription counts as 1
    }
  }

  return {
    invites,
    clients,
    subscriptions,
  };
}

/**
 * Check if user meets criteria for next rank
 */
export function meetsRankCriteria(
  currentRank: ClientRank,
  stats: UserStats
): { canProgress: boolean; reason?: string; nextRank?: ClientRank } {
  const ranks: ClientRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
  const currentIndex = ranks.indexOf(currentRank);
  
  // If already at max rank, can't progress
  if (currentIndex === ranks.length - 1) {
    return {
      canProgress: false,
      reason: 'Already at maximum rank',
    };
  }

  const nextRank = ranks[currentIndex + 1];
  const criteria = RANK_PROGRESSION_CRITERIA[nextRank];

  if (!criteria) {
    return {
      canProgress: false,
      reason: 'No criteria defined for next rank',
    };
  }

  // Check if user meets ANY of the criteria (OR condition)
  const meetsInviteCriteria = stats.invites >= criteria.invites;
  const meetsClientCriteria = stats.clients >= criteria.clients;
  const meetsSubscriptionCriteria = stats.subscriptions >= criteria.subscriptions;

  if (meetsInviteCriteria || meetsClientCriteria || meetsSubscriptionCriteria) {
    return {
      canProgress: true,
      nextRank,
      reason: `Met criteria: ${meetsInviteCriteria ? `${criteria.invites} invites` : ''}${meetsClientCriteria ? `${criteria.clients} clients` : ''}${meetsSubscriptionCriteria ? `${criteria.subscriptions} subscriptions` : ''}`,
    };
  }

  // Calculate what's needed
  const needed: string[] = [];
  if (stats.invites < criteria.invites) {
    needed.push(`${criteria.invites - stats.invites} more invites`);
  }
  if (stats.clients < criteria.clients) {
    needed.push(`${criteria.clients - stats.clients} more clients`);
  }
  if (stats.subscriptions < criteria.subscriptions) {
    needed.push(`${criteria.subscriptions - stats.subscriptions} more subscriptions`);
  }

  return {
    canProgress: false,
    nextRank,
    reason: `Need: ${needed.join(' OR ')}`,
  };
}

/**
 * Automatically check and promote user rank if criteria are met
 */
export async function checkAndPromoteRank(userId: string): Promise<{
  promoted: boolean;
  oldRank?: ClientRank;
  newRank?: ClientRank;
  subTier?: RankSubTier;
  message?: string;
}> {
  try {
    // Get current user data
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return {
        promoted: false,
        message: 'User not found',
      };
    }

    const userData = userDoc.data();
    const currentRank: ClientRank = userData?.clientRank || 'bronze';

    // Get user statistics
    const stats = await getUserStats(userId);

    // Check if user can progress
    const progressionCheck = meetsRankCriteria(currentRank, stats);

    if (!progressionCheck.canProgress || !progressionCheck.nextRank) {
      return {
        promoted: false,
        message: progressionCheck.reason || 'Cannot progress',
      };
    }

    // Determine sub-tier based on which criteria was met
    const criteria = RANK_PROGRESSION_CRITERIA[progressionCheck.nextRank];
    if (!criteria) {
      return {
        promoted: false,
        message: 'Invalid criteria',
      };
    }

    let newSubTier: RankSubTier = 'client';
    if (stats.invites >= criteria.invites && stats.clients < criteria.clients && stats.subscriptions < criteria.subscriptions) {
      newSubTier = 'invite';
    } else if (stats.subscriptions >= criteria.subscriptions) {
      newSubTier = 'subscription';
    } else if (stats.clients >= criteria.clients) {
      newSubTier = 'client';
    } else if (stats.invites >= criteria.invites) {
      newSubTier = 'invite';
    }

    // Update user rank
    await adminDb.collection('users').doc(userId).update({
      clientRank: progressionCheck.nextRank,
      rankSubTier: newSubTier,
      rankUpdatedAt: new Date().toISOString(),
      rankUpdatedBy: 'system', // System promotion
    });

    return {
      promoted: true,
      oldRank: currentRank,
      newRank: progressionCheck.nextRank,
      subTier: newSubTier,
      message: `Promoted from ${RANK_CONFIG[currentRank].displayName} to ${RANK_CONFIG[progressionCheck.nextRank].displayName} (${RANK_CONFIG[progressionCheck.nextRank].subTiers[newSubTier].displayName})`,
    };
  } catch (error: any) {
    console.error('Error checking and promoting rank:', error);
    return {
      promoted: false,
      message: error.message || 'Failed to check rank progression',
    };
  }
}

/**
 * Get rank progression status for a user
 */
export async function getRankProgressionStatus(userId: string): Promise<{
  currentRank: ClientRank;
  currentSubTier: RankSubTier;
  stats: UserStats;
  nextRank?: ClientRank;
  criteria?: RankProgressionCriteria;
  canProgress: boolean;
  progress: {
    invites: { current: number; required: number; percentage: number };
    clients: { current: number; required: number; percentage: number };
    subscriptions: { current: number; required: number; percentage: number };
  };
  reason?: string;
}> {
  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();
  const currentRank: ClientRank = userData?.clientRank || 'bronze';
  const currentSubTier: RankSubTier = userData?.rankSubTier || 'client';

  const stats = await getUserStats(userId);
  const progressionCheck = meetsRankCriteria(currentRank, stats);

  const ranks: ClientRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
  const currentIndex = ranks.indexOf(currentRank);
  const nextRank = currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : undefined;
  const criteria = nextRank ? RANK_PROGRESSION_CRITERIA[nextRank] : undefined;

  // Calculate progress percentages
  let progress = {
    invites: { current: stats.invites, required: 0, percentage: 0 },
    clients: { current: stats.clients, required: 0, percentage: 0 },
    subscriptions: { current: stats.subscriptions, required: 0, percentage: 0 },
  };

  if (criteria) {
    progress = {
      invites: {
        current: stats.invites,
        required: criteria.invites,
        percentage: Math.min(100, Math.round((stats.invites / criteria.invites) * 100)),
      },
      clients: {
        current: stats.clients,
        required: criteria.clients,
        percentage: Math.min(100, Math.round((stats.clients / criteria.clients) * 100)),
      },
      subscriptions: {
        current: stats.subscriptions,
        required: criteria.subscriptions,
        percentage: Math.min(100, Math.round((stats.subscriptions / criteria.subscriptions) * 100)),
      },
    };
  }

  return {
    currentRank,
    currentSubTier,
    stats,
    nextRank,
    criteria: criteria || undefined,
    canProgress: progressionCheck.canProgress || false,
    progress,
    reason: progressionCheck.reason,
  };
}

