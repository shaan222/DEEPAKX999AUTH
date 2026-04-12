/**
 * Security Statistics API
 * 
 * Protected endpoint for administrators to view security stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getSecurityStats, getRecentSecurityLogs } from '@/lib/security/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);
    
    // TODO: Verify admin role from custom claims or database
    // For now, any authenticated user can access (change in production)
    
    // Get security statistics
    const stats = getSecurityStats();
    const recentLogs = getRecentSecurityLogs(50);
    
    return NextResponse.json({
      success: true,
      stats,
      recentLogs,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching security stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security statistics' },
      { status: 500 }
    );
  }
}

