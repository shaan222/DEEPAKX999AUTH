import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Toggle Invite Code Status
 * Activates or deactivates an invite code
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

    const body = await request.json();
    const { inviteCodeId } = body;

    if (!inviteCodeId) {
      return NextResponse.json(
        { error: 'Missing required field: inviteCodeId' },
        { status: 400 }
      );
    }

    // Get invite code
    const inviteCodeDoc = await adminDb.collection('inviteCodes').doc(inviteCodeId).get();

    if (!inviteCodeDoc.exists) {
      return NextResponse.json(
        { error: 'Invite code not found' },
        { status: 404 }
      );
    }

    const inviteCodeData = inviteCodeDoc.data() as any;

    // Verify ownership
    if (inviteCodeData.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this invite code' },
        { status: 403 }
      );
    }

    // Toggle status
    const newStatus = !inviteCodeData.isActive;
    await adminDb.collection('inviteCodes').doc(inviteCodeId).update({
      isActive: newStatus,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      isActive: newStatus,
      message: `Invite code ${newStatus ? 'activated' : 'deactivated'}`,
    });

  } catch (error: any) {
    console.error('Error toggling invite code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to toggle invite code' },
      { status: 500 }
    );
  }
}

