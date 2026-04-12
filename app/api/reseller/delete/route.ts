import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Delete a reseller
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { resellerId } = body;

    if (!resellerId) {
      return NextResponse.json(
        { error: 'Missing resellerId' },
        { status: 400 }
      );
    }

    // Verify reseller belongs to this user
    const resellerDoc = await adminDb.collection('resellers').doc(resellerId).get();
    
    if (!resellerDoc.exists) {
      return NextResponse.json(
        { error: 'Reseller not found' },
        { status: 404 }
      );
    }

    const resellerData = resellerDoc.data() as any;
    if (resellerData?.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this reseller' },
        { status: 403 }
      );
    }

    // Delete reseller
    await adminDb.collection('resellers').doc(resellerId).delete();

    return NextResponse.json({
      success: true,
      message: 'Reseller deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting reseller:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete reseller' },
      { status: 500 }
    );
  }
}

