import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { checkAndPromoteRank, getRankProgressionStatus } from '@/lib/rank-progression';

export const dynamic = 'force-dynamic';

/**
 * Check and Promote User Rank
 * Automatically checks if user meets criteria for rank progression and promotes if eligible
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check and promote rank
    const result = await checkAndPromoteRank(userId);

    return NextResponse.json({
      success: result.promoted,
      ...result,
    });
  } catch (error: any) {
    console.error('Error checking rank progression:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check rank progression' },
      { status: 500 }
    );
  }
}

/**
 * Get Rank Progression Status
 * Returns current rank, stats, and progress toward next rank
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get rank progression status
    const status = await getRankProgressionStatus(userId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    console.error('Error getting rank progression status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get rank progression status' },
      { status: 500 }
    );
  }
}

