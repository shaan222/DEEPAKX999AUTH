/**
 * Protected Documentation Access Endpoint
 * 
 * Provides documentation only to authenticated users
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'You must be logged in to access documentation',
          redirectTo: '/unauthorized'
        },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (!decodedToken.uid) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid authentication token',
          redirectTo: '/unauthorized'
        },
        { status: 401 }
      );
    }

    // Get requested document
    const { searchParams } = new URL(request.url);
    const docType = searchParams.get('type') || 'hwid';

    // Return documentation metadata (actual content is in the React component)
    return NextResponse.json({
      success: true,
      message: 'Documentation access granted',
      userId: decodedToken.uid,
      availableDocs: ['hwid', 'integration', 'api'],
      requestedDoc: docType,
      accessGrantedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error accessing documentation:', error);
    return NextResponse.json(
      { 
        error: 'Unauthorized',
        message: 'Failed to verify authentication',
        redirectTo: '/unauthorized'
      },
      { status: 401 }
    );
  }
}

