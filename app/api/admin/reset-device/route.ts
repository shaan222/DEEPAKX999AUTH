import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { calculateGracePeriodEnd } from '@/lib/hwid-utils';

export const dynamic = 'force-dynamic';

/**
 * Admin Endpoint: Reset/unbind devices from a license
 * Allows admins or license owners to remove bound devices
 * Implements security verification to prevent abuse
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

    // Verify user exists and get role
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';

    // Get request body
    const body = await request.json();
    const { licenseKey, deviceHWID, resetAll } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'License key is required' },
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

    // Check if user owns this license or is admin
    if (!isAdmin && license.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied. You do not own this license.' },
        { status: 403 }
      );
    }

    let updatedDevices = license.authorizedHWIDs || [];
    let message = '';

    if (resetAll) {
      // Reset all devices
      updatedDevices = [];
      message = 'All devices have been unbound from this license.';

      // Update license
      await licensesRef.doc(licenseDoc.id).update({
        authorizedHWIDs: [],
        lockedAt: null,
        gracePeriodEndsAt: null,
        currentDevices: [], // Legacy field
        hwid: null, // Legacy field
        suspiciousActivityDetected: false, // Clear suspicious flag
      });

    } else if (deviceHWID) {
      // Remove specific device
      const initialCount = updatedDevices.length;
      updatedDevices = updatedDevices.filter((device: any) => device.hwid !== deviceHWID);

      if (updatedDevices.length === initialCount) {
        return NextResponse.json(
          { error: 'Device not found in authorized devices' },
          { status: 404 }
        );
      }

      message = 'Device has been unbound from this license.';

      const updateData: any = {
        authorizedHWIDs: updatedDevices,
        currentDevices: updatedDevices.map((d: any) => d.hwid), // Legacy field
      };

      // If all devices removed, clear locked fields
      if (updatedDevices.length === 0) {
        updateData.lockedAt = null;
        updateData.gracePeriodEndsAt = null;
        updateData.hwid = null;
        updateData.suspiciousActivityDetected = false;
      } else {
        // Extend grace period when removing a device
        updateData.gracePeriodEndsAt = calculateGracePeriodEnd();
      }

      await licensesRef.doc(licenseDoc.id).update(updateData);

    } else {
      return NextResponse.json(
        { error: 'Please specify either deviceHWID or resetAll=true' },
        { status: 400 }
      );
    }

    // Log the reset action for audit trail
    await adminDb.collection('auditLogs').add({
      action: resetAll ? 'RESET_ALL_DEVICES' : 'REMOVE_DEVICE',
      licenseKey: licenseKey,
      licenseId: licenseDoc.id,
      performedBy: userId,
      performedByEmail: decodedToken.email,
      isAdmin: isAdmin,
      deviceHWID: deviceHWID || null,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: message,
      remainingDevices: updatedDevices.length,
      availableSlots: (license.maxDevices || 1) - updatedDevices.length,
      gracePeriodEndsAt: updatedDevices.length > 0 ? calculateGracePeriodEnd() : null,
    });

  } catch (error: any) {
    console.error('Error resetting devices:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset devices' },
      { status: 500 }
    );
  }
}

