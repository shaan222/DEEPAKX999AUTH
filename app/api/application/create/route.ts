import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { canCreateApplication } from '@/lib/subscription-utils';

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
    const { name, description, currentVersion, minimumVersion } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Application name is required' },
        { status: 400 }
      );
    }

    // Check subscription limits
    const limitCheck = await canCreateApplication(userId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: limitCheck.reason || 'Application limit reached',
          limitReached: true,
          current: limitCheck.current,
          limit: limitCheck.limit,
        },
        { status: 403 }
      );
    }

    // Generate unique API key
    const apiKey = `sk_${uuidv4().replace(/-/g, '')}`;

    const appData = {
      name,
      description: description || '',
      apiKey,
      userId,
      createdAt: new Date().toISOString(),
      isActive: true,
      currentVersion: currentVersion || '1.0.0',  // Default version
      minimumVersion: minimumVersion || '1.0.0',  // Default minimum version
    };

    const docRef = await adminDb.collection('applications').add(appData);

    return NextResponse.json({
      success: true,
      application: {
        id: docRef.id,
        ...appData,
      },
    });
  } catch (error: any) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create application' },
      { status: 500 }
    );
  }
}

