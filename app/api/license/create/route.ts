import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { generateLicenseKey } from '@/lib/utils';
import { canCreateLicense } from '@/lib/subscription-utils';
import { checkAndPromoteRank } from '@/lib/rank-progression';

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
    const { appId, expiryDays, maxDevices, metadata } = body;

    if (!appId || !expiryDays) {
      return NextResponse.json(
        { error: 'Missing required fields: appId and expiryDays' },
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
        { error: 'Unauthorized to create licenses for this application' },
        { status: 403 }
      );
    }

    // Check subscription limits
    const limitCheck = await canCreateLicense(userId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason || 'License limit reached',
          limitReached: true,
          current: limitCheck.current,
          limit: limitCheck.limit,
        },
        { status: 403 }
      );
    }

    const licenseKey = generateLicenseKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

    const licenseData = {
      key: licenseKey,
      userId,
      appId,
      appName: app?.name || 'Unknown App',
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true,
      maxDevices: maxDevices || 1,
      currentDevices: [],
      metadata: metadata || {},
    };

    const docRef = await adminDb.collection('licenses').add(licenseData);

    // Check and promote rank if criteria are met (non-blocking)
    checkAndPromoteRank(userId).catch((error) => {
      console.error('Error checking rank progression after license creation:', error);
    });

    return NextResponse.json({
      success: true,
      license: {
        id: docRef.id,
        ...licenseData,
      },
    });
  } catch (error: any) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create license' },
      { status: 500 }
    );
  }
}

