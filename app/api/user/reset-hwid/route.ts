import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Reset HWID for a user
 * Unlocks the device binding so user can login from a new device
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

    const body = await request.json();
    const { appId, userDocId } = body;

    if (!appId || !userDocId) {
      return NextResponse.json(
        { error: 'Application ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify the app belongs to this admin
    const appDoc = await adminDb.collection('applications').doc(appId).get();
    if (!appDoc.exists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const app = appDoc.data();
    if (app?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to modify users for this application' },
        { status: 403 }
      );
    }

    // Get the user document
    const userDoc = await adminDb.collection('appUsers').doc(userDocId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (!userData || userData.appId !== appId) {
      return NextResponse.json(
        { error: 'User does not belong to this application' },
        { status: 403 }
      );
    }

    // Reset HWID and unlock
    await adminDb.collection('appUsers').doc(userDocId).update({
      hwid: null,
      hwidLocked: false,
      lastIp: null,
      updatedAt: new Date().toISOString(),
    });

    console.log(`HWID reset for user ${userData.username} (${userDocId}) by admin ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'HWID reset successfully. User can now login from a new device.',
    });
  } catch (error: any) {
    console.error('Error resetting HWID:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset HWID' },
      { status: 500 }
    );
  }
}
