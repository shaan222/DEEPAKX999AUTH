import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get query parameter for appId filter
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');

    // Get user's licenses
    const licensesRef = adminDb.collection('licenses');
    let query = licensesRef.where('userId', '==', userId);
    
    if (appId) {
      query = query.where('appId', '==', appId) as any;
    }
    
    const snapshot = await query.get();

    const licenses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ licenses });
  } catch (error: any) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch licenses' },
      { status: 500 }
    );
  }
}

