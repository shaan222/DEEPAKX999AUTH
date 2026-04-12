import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Admin Endpoint: Update device label
 * Allows users to give friendly names to their bound devices
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

    // Get request body
    const body = await request.json();
    const { licenseKey, deviceHWID, label } = body;

    if (!licenseKey || !deviceHWID || !label) {
      return NextResponse.json(
        { error: 'licenseKey, deviceHWID, and label are required' },
        { status: 400 }
      );
    }

    // Validate label
    if (label.length > 50) {
      return NextResponse.json(
        { error: 'Label must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Find the license
    const licensesRef = adminDb.collection('licenses');
    const licenseSnapshot = await licensesRef.where('key', '==', licenseKey).get();

    if (licenseSnapshot.empty) {
      return NextResponse.json(
        { error: 'License not found' },
        { status: 404 }
      );
    }

    const licenseDoc = licenseSnapshot.docs[0];
    const license = licenseDoc.data();

    // Check if user owns this license
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const isAdmin = userDoc.exists && userDoc.data()?.role === 'admin';

    if (!isAdmin && license.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this license.' },
        { status: 403 }
      );
    }

    // Find and update the device
    const authorizedHWIDs = license.authorizedHWIDs || [];
    const deviceIndex = authorizedHWIDs.findIndex((device: any) => device.hwid === deviceHWID);

    if (deviceIndex === -1) {
      return NextResponse.json(
        { error: 'Device not found in authorized devices' },
        { status: 404 }
      );
    }

    // Update the label
    authorizedHWIDs[deviceIndex].label = label;

    await licensesRef.doc(licenseDoc.id).update({
      authorizedHWIDs: authorizedHWIDs,
    });

    return NextResponse.json({
      success: true,
      message: 'Device label updated successfully',
      device: authorizedHWIDs[deviceIndex],
    });

  } catch (error: any) {
    console.error('Error updating device label:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update device label' },
      { status: 500 }
    );
  }
}

