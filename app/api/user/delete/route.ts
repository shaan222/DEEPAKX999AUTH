import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Protected endpoint for deleting a user
 * Only the application owner can delete users
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { userId: appUserId, appId } = body;

    if (!appUserId || !appId) {
      return NextResponse.json(
        { error: 'User ID and App ID are required' },
        { status: 400 }
      );
    }

    // Verify the app belongs to this user
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
        { error: 'Unauthorized to delete users for this application' },
        { status: 403 }
      );
    }

    // Delete the user
    const userDoc = await adminDb.collection('appUsers').doc(appUserId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    if (userData?.appId !== appId) {
      return NextResponse.json(
        { error: 'User does not belong to this application' },
        { status: 403 }
      );
    }

    await adminDb.collection('appUsers').doc(appUserId).delete();

    return NextResponse.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}

