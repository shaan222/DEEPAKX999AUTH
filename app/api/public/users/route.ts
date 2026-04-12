import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getUserStats } from '@/lib/rank-progression';

export const dynamic = 'force-dynamic';

/**
 * Public endpoint for listing all users with their ranks (for leaderboard)
 * Only returns public information: username, rank, and basic stats
 */
export async function GET(_request: NextRequest) {
  try {
    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();

    const users = await Promise.all(
      usersSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userId = doc.id;

        // Get user stats for leaderboard
        let stats = { invites: 0, clients: 0, subscriptions: 0 };
        try {
          stats = await getUserStats(userId);
        } catch (error) {
          console.error(`Error getting stats for user ${userId}:`, error);
        }

        return {
          id: userId,
          username: data.username || null,
          // Email removed for security - only admins can see emails via /api/admin/users
          clientRank: data.clientRank || 'bronze',
          rankSubTier: data.rankSubTier || 'client',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || (typeof data.createdAt === 'string' ? data.createdAt : null),
          stats,
        };
      })
    );

    return NextResponse.json({ 
      success: true,
      users: users.filter(u => u.username) // Only return users with username (emails removed for security)
    });
  } catch (error: any) {
    console.error('Error fetching public users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

