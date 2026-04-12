import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Reseller Authentication
 * Authenticates a reseller using their API key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing required field: apiKey' },
        { status: 400 }
      );
    }

    // Find reseller by API key
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
    const resellerData = resellerDoc.data() as any;
    const reseller = { id: resellerDoc.id, ...resellerData };

    // Check if reseller is active
    if (!resellerData.isActive) {
      return NextResponse.json(
        { error: 'Reseller account is inactive. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // Update last login
    await adminDb.collection('resellers').doc(resellerDoc.id).update({
      lastLoginAt: new Date().toISOString(),
    });

    // Return reseller info (without sensitive data for owner)
    return NextResponse.json({
      success: true,
      reseller: {
        id: reseller.id,
        name: resellerData.name,
        email: resellerData.email,
        appId: resellerData.appId,
        appName: resellerData.appName,
        isActive: resellerData.isActive,
        canCreateLicenses: resellerData.canCreateLicenses,
        canViewLicenses: resellerData.canViewLicenses,
        canDeleteLicenses: resellerData.canDeleteLicenses,
        maxLicenses: resellerData.maxLicenses,
        currentLicenses: resellerData.currentLicenses,
        totalSales: resellerData.totalSales,
        commissionRate: resellerData.commissionRate,
        company: resellerData.company,
      },
      message: 'Authentication successful',
    });
  } catch (error: any) {
    console.error('Error authenticating reseller:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

