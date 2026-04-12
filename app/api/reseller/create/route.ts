import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { getEffectiveTier, getSubscriptionLimits, isWithinLimit } from '@/lib/subscription-limits';

export const dynamic = 'force-dynamic';

/**
 * Create a new reseller for an application
 * Protected endpoint - requires Firebase authentication
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
    const ownerId = decodedToken.uid;

    const body = await request.json();
    const {
      appId,
      email,
      name,
      phone,
      company,
      notes,
      maxLicenses,
      canCreateLicenses,
      canViewLicenses,
      canDeleteLicenses,
      commissionRate,
    } = body;

    // Validate required fields
    if (!appId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: appId, email, and name' },
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
    if (app?.userId !== ownerId) {
      return NextResponse.json(
        { error: 'Unauthorized to create resellers for this application' },
        { status: 403 }
      );
    }

    // Check subscription limits
    const userDoc = await adminDb.collection('users').doc(ownerId).get();
    const userData = userDoc.data();
    const effectiveTier = getEffectiveTier(userData?.subscription);
    const limits = getSubscriptionLimits(effectiveTier);

    // Check if resellers are enabled
    if (!limits.resellersEnabled) {
      return NextResponse.json(
        {
          error: 'Reseller feature is not available on your plan',
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Count existing resellers for this app
    const resellersSnapshot = await adminDb
      .collection('resellers')
      .where('appId', '==', appId)
      .where('ownerId', '==', ownerId)
      .get();

    const currentResellers = resellersSnapshot.size;

    // Check reseller limit per app
    if (!isWithinLimit(currentResellers, limits.maxResellersPerApp)) {
      return NextResponse.json(
        {
          error: `Maximum reseller limit (${limits.maxResellersPerApp}) reached for this application`,
          limitReached: true,
          current: currentResellers,
          limit: limits.maxResellersPerApp,
        },
        { status: 403 }
      );
    }

    // Check if reseller email already exists for this owner
    const existingResellerSnapshot = await adminDb
      .collection('resellers')
      .where('email', '==', email)
      .where('ownerId', '==', ownerId)
      .get();

    if (!existingResellerSnapshot.empty) {
      return NextResponse.json(
        {
          error: 'A reseller with this email already exists in your account',
        },
        { status: 400 }
      );
    }

    // Generate unique API key for reseller
    const resellerApiKey = `rs_${uuidv4().replace(/-/g, '')}`;

    // Create reseller
    const resellerData = {
      email,
      name,
      ownerId,
      appId,
      appName: app?.name || 'Unknown App',
      apiKey: resellerApiKey,
      isActive: true,
      createdAt: new Date().toISOString(),
      
      // Permissions
      canCreateLicenses: canCreateLicenses !== false, // Default true
      canViewLicenses: canViewLicenses !== false, // Default true
      canDeleteLicenses: canDeleteLicenses === true, // Default false
      
      // Limits
      maxLicenses: maxLicenses || -1, // -1 = unlimited
      currentLicenses: 0,
      
      // Sales tracking
      totalSales: 0,
      totalRevenue: 0,
      commissionRate: commissionRate || 0,
      
      // Contact
      phone: phone || null,
      company: company || null,
      notes: notes || null,
      
      metadata: {},
    };

    const docRef = await adminDb.collection('resellers').add(resellerData);

    return NextResponse.json({
      success: true,
      reseller: {
        id: docRef.id,
        ...resellerData,
      },
      message: 'Reseller created successfully',
    });
  } catch (error: any) {
    console.error('Error creating reseller:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create reseller' },
      { status: 500 }
    );
  }
}

