import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Update User Client Rank (Admin Only)
 * Allows admins to set user ranks for visual enhancements
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const adminUserId = decodedToken.uid;

    // Check if user is admin
    const adminDoc = await adminDb.collection('users').doc(adminUserId).get();
    const adminData = adminDoc.data() as any;
    
    if (!adminData || adminData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, clientRank, rankSubTier } = body;

    if (!userId || !clientRank) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, clientRank' },
        { status: 400 }
      );
    }

    // Validate rank
    const validRanks = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
    if (!validRanks.includes(clientRank)) {
      return NextResponse.json(
        { error: `Invalid rank. Must be one of: ${validRanks.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate sub-tier if provided
    if (rankSubTier) {
      const validSubTiers = ['invite', 'client', 'subscription'];
      if (!validSubTiers.includes(rankSubTier)) {
        return NextResponse.json(
          { error: `Invalid sub-tier. Must be one of: ${validSubTiers.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Check if target user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user rank and sub-tier
    const updateData: any = {
      clientRank: clientRank,
      rankUpdatedAt: new Date().toISOString(),
      rankUpdatedBy: adminUserId,
    };

    if (rankSubTier) {
      updateData.rankSubTier = rankSubTier;
    }

    await adminDb.collection('users').doc(userId).update(updateData);

    return NextResponse.json({
      success: true,
      message: `User rank updated to ${clientRank}${rankSubTier ? ` (${rankSubTier})` : ''}`,
    });

  } catch (error: any) {
    console.error('Error updating user rank:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user rank' },
      { status: 500 }
    );
  }
}
