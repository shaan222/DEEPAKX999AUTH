import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

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
    const { licenseId } = body;

    if (!licenseId) {
      return NextResponse.json(
        { error: 'License ID is required' },
        { status: 400 }
      );
    }

    // Get license document
    const licenseDoc = await adminDb.collection('licenses').doc(licenseId).get();

    if (!licenseDoc.exists) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    const license = licenseDoc.data();

    // Verify ownership
    if (license?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this license' },
        { status: 403 }
      );
    }

    // Delete license
    await adminDb.collection('licenses').doc(licenseId).delete();

    return NextResponse.json({ success: true, message: 'License deleted' });
  } catch (error: any) {
    console.error('Error deleting license:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete license' },
      { status: 500 }
    );
  }
}

