import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Delete User (Admin Only)
 * Permanently deletes a user and all their data
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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Check if target user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as any;

    // Prevent deleting admin users
    if (userData.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (userId === adminUserId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Delete user's applications
    const applicationsSnapshot = await adminDb
      .collection('applications')
      .where('ownerId', '==', userId)
      .get();

    const deletions: Promise<any>[] = [];
    applicationsSnapshot.docs.forEach((doc) => {
      deletions.push(adminDb.collection('applications').doc(doc.id).delete());
    });

    // Delete user's licenses
    const licensesSnapshot = await adminDb
      .collection('licenses')
      .where('ownerId', '==', userId)
      .get();

    licensesSnapshot.docs.forEach((doc) => {
      deletions.push(adminDb.collection('licenses').doc(doc.id).delete());
    });

    // Delete user's resellers
    const resellersSnapshot = await adminDb
      .collection('resellers')
      .where('ownerId', '==', userId)
      .get();

    resellersSnapshot.docs.forEach((doc) => {
      deletions.push(adminDb.collection('resellers').doc(doc.id).delete());
    });

    // Wait for all deletions
    await Promise.all(deletions);

    // Delete from Firebase Authentication
    await adminAuth.deleteUser(userId);

    // Delete user document from Firestore
    await adminDb.collection('users').doc(userId).delete();

    return NextResponse.json({
      success: true,
      message: 'User and all associated data deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}


