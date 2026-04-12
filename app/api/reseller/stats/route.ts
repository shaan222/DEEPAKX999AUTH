import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Get reseller statistics
 * Can be called by reseller (with API key) or owner (with auth token)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, resellerId } = body;

    let reseller: any;
    let resellerDocId: string;

    if (apiKey) {
      // Reseller authentication
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
      reseller = resellerDoc.data() as any;
      resellerDocId = resellerDoc.id;
    } else if (resellerId) {
      // Owner can query by reseller ID
      const resellerDoc = await adminDb.collection('resellers').doc(resellerId).get();
      if (!resellerDoc.exists) {
        return NextResponse.json(
          { error: 'Reseller not found' },
          { status: 404 }
        );
      }
      reseller = resellerDoc.data() as any;
      resellerDocId = resellerId;
    } else {
      return NextResponse.json(
        { error: 'Missing apiKey or resellerId' },
        { status: 400 }
      );
    }

    // Get licenses created by this reseller
    const licensesSnapshot = await adminDb
      .collection('licenses')
      .where('resellerId', '==', resellerDocId)
      .get();

    const licenses = licensesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate statistics
    const stats = {
      reseller: {
        id: resellerDocId,
        name: reseller.name,
        email: reseller.email,
        appName: reseller.appName,
        isActive: reseller.isActive,
        createdAt: reseller.createdAt,
      },
      licenses: {
        total: licenses.length,
        active: licenses.filter((l: any) => l.isActive && new Date(l.expiresAt) > new Date()).length,
        expired: licenses.filter((l: any) => new Date(l.expiresAt) <= new Date()).length,
        inactive: licenses.filter((l: any) => !l.isActive).length,
      },
      sales: {
        totalSales: reseller.totalSales || 0,
        totalRevenue: reseller.totalRevenue || 0,
        commissionRate: reseller.commissionRate || 0,
        commissionEarned: ((reseller.totalRevenue || 0) * (reseller.commissionRate || 0)) / 100,
      },
      limits: {
        maxLicenses: reseller.maxLicenses,
        currentLicenses: reseller.currentLicenses,
        remaining: reseller.maxLicenses === -1 ? 'Unlimited' : reseller.maxLicenses - reseller.currentLicenses,
      },
      activity: {
        lastSaleAt: reseller.lastSaleAt || null,
        lastLoginAt: reseller.lastLoginAt || null,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
      licenses: licenses.slice(0, 10), // Return last 10 licenses
    });
  } catch (error: any) {
    console.error('Error getting reseller stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}

