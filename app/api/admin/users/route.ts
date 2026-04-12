import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Get All Users (Admin Only)
 * Returns list of all users in the system
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data() as any;
    
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        username: data.username || null, // Include permanent username
        displayName: data.displayName || null,
        role: data.role || 'user',
        clientRank: data.clientRank || 'bronze', // Include client rank
        rankSubTier: data.rankSubTier || 'client', // Include sub-tier
        createdAt: data.createdAt,
        lastLoginAt: data.lastLoginAt || null,
        subscription: data.subscription || null,
        provider: data.provider || 'email',
        inviteCode: data.inviteCode || null,
        invitedBy: data.invitedBy || null,
      };
    });

    // Sort by creation date (newest first)
    users.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      users,
    });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}


