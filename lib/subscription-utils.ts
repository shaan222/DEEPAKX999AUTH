/**
 * Subscription Utilities
 * Helper functions for checking limits and subscription status
 */

import { adminDb } from './firebase-admin';
import { Subscription, SubscriptionTier } from './types';
import { 
  getSubscriptionLimits, 
  getEffectiveTier, 
  isWithinLimit
} from './subscription-limits';

/**
 * Get user's subscription from Firestore
 */
export async function getUserSubscription(userId: string): Promise<Subscription | undefined> {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return undefined;
    }
    
    const userData = userDoc.data();
    return userData?.subscription || undefined;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return undefined;
  }
}

/**
 * Check if user can create more applications
 */
export async function canCreateApplication(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}> {
  const subscription = await getUserSubscription(userId);
  const effectiveTier = getEffectiveTier(subscription);
  const limits = getSubscriptionLimits(effectiveTier);
  
  // Count existing applications
  const appsSnapshot = await adminDb.collection('applications')
    .where('userId', '==', userId)
    .get();
  
  const current = appsSnapshot.size;
  
  if (!isWithinLimit(current, limits.maxApplications)) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limits.maxApplications} application(s). ${effectiveTier === 'free' ? 'Upgrade to Pro for unlimited applications.' : 'Upgrade to Pro for unlimited applications.'}`,
      current,
      limit: limits.maxApplications,
    };
  }
  
  return {
    allowed: true,
    current,
    limit: limits.maxApplications,
  };
}

/**
 * Check if user can create more licenses
 */
export async function canCreateLicense(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}> {
  const subscription = await getUserSubscription(userId);
  const effectiveTier = getEffectiveTier(subscription);
  const limits = getSubscriptionLimits(effectiveTier);
  
  // Count existing licenses
  const licensesSnapshot = await adminDb.collection('licenses')
    .where('userId', '==', userId)
    .get();
  
  const current = licensesSnapshot.size;
  
  if (!isWithinLimit(current, limits.maxLicenses)) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limits.maxLicenses} license(s). Upgrade to Pro for unlimited licenses.`,
      current,
      limit: limits.maxLicenses,
    };
  }
  
  return {
    allowed: true,
    current,
    limit: limits.maxLicenses,
  };
}

/**
 * Check if user can create more users (end-users/clients)
 */
export async function canCreateUser(userId: string, appId?: string): Promise<{
  allowed: boolean;
  reason?: string;
  currentTotal: number;
  currentPerApp: number;
  limitTotal: number;
  limitPerApp: number;
}> {
  const subscription = await getUserSubscription(userId);
  const effectiveTier = getEffectiveTier(subscription);
  const limits = getSubscriptionLimits(effectiveTier);
  
  // Count total users across all apps
  const appsSnapshot = await adminDb.collection('applications')
    .where('userId', '==', userId)
    .get();
  
  let currentTotal = 0;
  let currentPerApp = 0;
  
  if (appId) {
    // Count users for specific app
    const usersSnapshot = await adminDb.collection('appUsers')
      .where('appId', '==', appId)
      .get();
    currentPerApp = usersSnapshot.size;
  }
  
  // Count all users across user's applications
  for (const appDoc of appsSnapshot.docs) {
    const usersSnapshot = await adminDb.collection('appUsers')
      .where('appId', '==', appDoc.id)
      .get();
    currentTotal += usersSnapshot.size;
  }
  
  // Check total limit
  if (!isWithinLimit(currentTotal, limits.maxUsers)) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limits.maxUsers} total user(s). Upgrade to Pro for unlimited users.`,
      currentTotal,
      currentPerApp,
      limitTotal: limits.maxUsers,
      limitPerApp: limits.maxUsersPerApp,
    };
  }
  
  // Check per-app limit if appId provided
  if (appId && !isWithinLimit(currentPerApp, limits.maxUsersPerApp)) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limits.maxUsersPerApp} user(s) for this application. Upgrade to Pro for unlimited users.`,
      currentTotal,
      currentPerApp,
      limitTotal: limits.maxUsers,
      limitPerApp: limits.maxUsersPerApp,
    };
  }
  
  return {
    allowed: true,
    currentTotal,
    currentPerApp,
    limitTotal: limits.maxUsers,
    limitPerApp: limits.maxUsersPerApp,
  };
}

/**
 * Get subscription status summary
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  tier: SubscriptionTier;
  daysLeft?: number;
  limits: {
    applications: { current: number; limit: number };
    licenses: { current: number; limit: number };
    users: { current: number; limit: number };
  };
}> {
  const subscription = await getUserSubscription(userId);
  const effectiveTier = getEffectiveTier(subscription);
  const limits = getSubscriptionLimits(effectiveTier);
  
  // Safety check: ensure limits is defined
  if (!limits) {
    // Fallback to free tier limits if something went wrong
    const freeLimits = getSubscriptionLimits('free');
    return {
      tier: 'free',
      limits: {
        applications: {
          current: 0,
          limit: freeLimits.maxApplications,
        },
        licenses: {
          current: 0,
          limit: freeLimits.maxLicenses,
        },
        users: {
          current: 0,
          limit: freeLimits.maxUsers,
        },
      },
    };
  }
  
  // Calculate days left for paid subscription
  let daysLeft: number | undefined;
  if (effectiveTier === 'pro' && subscription?.endDate) {
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    daysLeft = Math.max(0, days);
  }
  
  // Count resources
  const appsSnapshot = await adminDb.collection('applications')
    .where('userId', '==', userId)
    .get();
  
  const licensesSnapshot = await adminDb.collection('licenses')
    .where('userId', '==', userId)
    .get();
  
  let userCount = 0;
  for (const appDoc of appsSnapshot.docs) {
    const usersSnapshot = await adminDb.collection('appUsers')
      .where('appId', '==', appDoc.id)
      .get();
    userCount += usersSnapshot.size;
  }
  
  return {
    tier: effectiveTier,
    daysLeft,
    limits: {
      applications: {
        current: appsSnapshot.size,
        limit: limits.maxApplications,
      },
      licenses: {
        current: licensesSnapshot.size,
        limit: limits.maxLicenses,
      },
      users: {
        current: userCount,
        limit: limits.maxUsers,
      },
    },
  };
}

