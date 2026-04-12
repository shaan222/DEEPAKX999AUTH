import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

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
    const { appId, currentVersion, minimumVersion } = body;

    if (!appId || !currentVersion || !minimumVersion) {
      return NextResponse.json(
        { error: 'Missing required fields: appId, currentVersion, minimumVersion' },
        { status: 400 }
      );
    }

    // Verify the application belongs to the user
    const appRef = adminDb.collection('applications').doc(appId);
    const appDoc = await appRef.get();

    if (!appDoc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const appData = appDoc.data();
    if (appData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the version fields
    await appRef.update({
      currentVersion,
      minimumVersion,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Version updated successfully',
      currentVersion,
      minimumVersion,
    });
  } catch (error: any) {
    console.error('Error updating application version:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update version' },
      { status: 500 }
    );
  }
}

