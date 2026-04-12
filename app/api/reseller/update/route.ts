import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Update reseller details
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

    const body = await request.json();
    const { resellerId, ...updates } = body;

    if (!resellerId) {
      return NextResponse.json(
        { error: 'Missing resellerId' },
        { status: 400 }
      );
    }

    // Verify reseller belongs to this user
    const resellerDoc = await adminDb.collection('resellers').doc(resellerId).get();
    
    if (!resellerDoc.exists) {
      return NextResponse.json(
        { error: 'Reseller not found' },
        { status: 404 }
      );
    }

    const resellerData = resellerDoc.data() as any;
    if (resellerData?.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this reseller' },
        { status: 403 }
      );
    }

    // Remove fields that shouldn't be updated directly
    delete updates.resellerId;
    delete updates.id;
    delete updates.ownerId;
    delete updates.appId;
    delete updates.apiKey;
    delete updates.createdAt;
    delete updates.totalSales;
    delete updates.totalRevenue;
    delete updates.currentLicenses;

    // Update reseller
    await adminDb.collection('resellers').doc(resellerId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Reseller updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating reseller:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update reseller' },
      { status: 500 }
    );
  }
}

