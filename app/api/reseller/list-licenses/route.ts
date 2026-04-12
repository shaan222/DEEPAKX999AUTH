import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * List licenses created by a reseller
 * Requires reseller API key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, limit = 10 } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing required field: apiKey' },
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

    // Check if reseller has permission to view licenses
    if (!reseller.canViewLicenses) {
      return NextResponse.json(
        { error: 'You do not have permission to view licenses' },
        { status: 403 }
      );
    }

    // Fetch licenses created by this reseller
    const licensesSnapshot = await adminDb
      .collection('licenses')
      .where('resellerId', '==', resellerDoc.id)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const licenses = licensesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      licenses,
      count: licenses.length,
    });
  } catch (error: any) {
    console.error('Error listing licenses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list licenses' },
      { status: 500 }
    );
  }
}

