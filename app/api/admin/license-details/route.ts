import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Admin Endpoint: Get detailed license information including all bound devices and IP addresses
 * Requires authentication and admin role
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

    // Verify admin role or license ownership
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';

    // Get license key from query params
    const { searchParams } = new URL(request.url);
    const licenseKey = searchParams.get('licenseKey');

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

    // Get application details
    let appName = license.appName;
    if (license.appId) {
      const appDoc = await adminDb.collection('applications').doc(license.appId).get();
      if (appDoc.exists) {
        appName = appDoc.data()?.name || appName;
      }
    }

    // Compile comprehensive license details
    const details = {
      license: {
        id: licenseDoc.id,
        key: license.key,
        appName: appName,
        appId: license.appId,
        userId: license.userId,
        isActive: license.isActive,
        createdAt: license.createdAt,
        expiresAt: license.expiresAt,
        lastUsed: license.lastUsed,
        maxDevices: license.maxDevices || 1,
      },
      deviceBinding: {
        lockedAt: license.lockedAt,
        gracePeriodActive: license.gracePeriodEndsAt && new Date(license.gracePeriodEndsAt) > new Date(),
        gracePeriodEndsAt: license.gracePeriodEndsAt,
        authorizedDevices: license.authorizedHWIDs || [],
        boundDevicesCount: license.authorizedHWIDs?.length || 0,
        availableSlots: Math.max(0, (license.maxDevices || 1) - (license.authorizedHWIDs?.length || 0)),
      },
      ipTracking: {
        totalIPs: license.ipAddresses?.length || 0,
        uniqueCountries: Array.from(new Set(license.ipAddresses?.map((ip: any) => ip.country).filter(Boolean))).length,
        uniqueCities: Array.from(new Set(license.ipAddresses?.map((ip: any) => ip.city).filter(Boolean))).length,
        ipAddresses: license.ipAddresses || [],
      },
      security: {
        suspiciousActivityDetected: license.suspiciousActivityDetected || false,
        suspiciousIPs: license.ipAddresses?.filter((ip: any) => ip.isSuspicious) || [],
      },
    };

    return NextResponse.json(details);

  } catch (error: any) {
    console.error('Error fetching license details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch license details' },
      { status: 500 }
    );
  }
}

