import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { generateLicenseKey } from '@/lib/utils';
import { checkAndPromoteRank } from '@/lib/rank-progression';

export const dynamic = 'force-dynamic';

/**
 * Reseller License Creation
 * Allows resellers to create licenses for their assigned application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, expiryDays, maxDevices, metadata, customerEmail, customerName } = body;

    if (!apiKey || !expiryDays) {
      return NextResponse.json(
        { error: 'Missing required fields: apiKey and expiryDays' },
        { status: 400 }
      );
    }

    // Find and authenticate reseller
    const resellersSnapshot = await adminDb
      .collection('resellers')
      .where('apiKey', '==', apiKey)
      .limit(1)
      .get();

    if (resellersSnapshot.empty) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const resellerDoc = resellersSnapshot.docs[0];
    const reseller = resellerDoc.data() as any;

    // Check if reseller is active
    if (!reseller.isActive) {
      return NextResponse.json(
        { error: 'Reseller account is inactive' },
        { status: 403 }
      );
    }

    // Check if reseller has permission to create licenses
    if (!reseller.canCreateLicenses) {
      return NextResponse.json(
        { error: 'You do not have permission to create licenses' },
        { status: 403 }
      );
    }

    // Check reseller license limit
    if (reseller.maxLicenses !== -1 && reseller.currentLicenses >= reseller.maxLicenses) {
      return NextResponse.json(
        {
          error: `License creation limit reached. You can create up to ${reseller.maxLicenses} licenses.`,
          limitReached: true,
          current: reseller.currentLicenses,
          limit: reseller.maxLicenses,
        },
        { status: 403 }
      );
    }

    // Get app details
    const appDoc = await adminDb.collection('applications').doc(reseller.appId).get();
    if (!appDoc.exists) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const app = appDoc.data();

    // Generate license
    const licenseKey = generateLicenseKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

    const licenseData = {
      key: licenseKey,
      userId: reseller.ownerId, // Owner of the app
      appId: reseller.appId,
      appName: app?.name || 'Unknown App',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      maxDevices: maxDevices || 1,
      currentDevices: [],
      
      // Reseller tracking
      resellerId: resellerDoc.id,
      resellerName: reseller.name,
      resellerEmail: reseller.email,
      
      // Customer info (if provided)
      customerEmail: customerEmail || null,
      customerName: customerName || null,
      
      metadata: {
        ...metadata,
        createdByReseller: true,
      },
    };

    const licenseDocRef = await adminDb.collection('licenses').add(licenseData);

    // Update reseller stats
    await adminDb.collection('resellers').doc(resellerDoc.id).update({
      currentLicenses: (reseller.currentLicenses || 0) + 1,
      totalSales: (reseller.totalSales || 0) + 1,
      lastSaleAt: new Date().toISOString(),
    });

    // Check and promote rank for the owner if criteria are met (non-blocking)
    checkAndPromoteRank(reseller.ownerId).catch((error) => {
      console.error('Error checking rank progression after reseller license creation:', error);
    });

    return NextResponse.json({
      success: true,
      license: {
        id: licenseDocRef.id,
        ...licenseData,
      },
      message: 'License created successfully',
    });
  } catch (error: any) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create license' },
      { status: 500 }
    );
  }
}

