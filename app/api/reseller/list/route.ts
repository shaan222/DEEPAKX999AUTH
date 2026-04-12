import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * List all resellers for the authenticated user
 * Optional query param: appId - filter by specific application
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    // Build query
    let query = adminDb.collection('resellers').where('ownerId', '==', userId);

    if (appId) {
      query = query.where('appId', '==', appId);
    }

    const snapshot = await query.get();

    const resellers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate stats
    const stats = {
      total: resellers.length,
      active: resellers.filter((r: any) => r.isActive).length,
      inactive: resellers.filter((r: any) => !r.isActive).length,
      totalSales: resellers.reduce((sum: number, r: any) => sum + (r.totalSales || 0), 0),
      totalRevenue: resellers.reduce((sum: number, r: any) => sum + (r.totalRevenue || 0), 0),
    };

    return NextResponse.json({
      success: true,
      resellers,
      stats,
    });
  } catch (error: any) {
    console.error('Error listing resellers:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list resellers' },
      { status: 500 }
    );
  }
}

