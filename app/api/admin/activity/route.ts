import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Get System Activity (Admin Only)
 * Returns recent system activities and events
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

    // Check if user is admin
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data() as any;
    
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Fetch recent data for activity generation
    const [usersSnapshot, applicationsSnapshot, licensesSnapshot, resellersSnapshot] = await Promise.all([
      adminDb.collection('users').orderBy('createdAt', 'desc').limit(50).get(),
      adminDb.collection('applications').orderBy('createdAt', 'desc').limit(50).get(),
      adminDb.collection('licenses').orderBy('createdAt', 'desc').limit(50).get(),
      adminDb.collection('resellers').orderBy('createdAt', 'desc').limit(50).get(),
    ]);

    const activities: any[] = [];

    // Generate user activities
    usersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: `user-${doc.id}`,
        type: 'user',
        action: `New user registered: ${data.email}`,
        userId: doc.id,
        userEmail: data.email,
        details: {
          provider: data.provider || 'email',
          role: data.role || 'user',
        },
        timestamp: data.createdAt,
      });

      if (data.lastLoginAt) {
        activities.push({
          id: `user-login-${doc.id}`,
          type: 'security',
          action: `User logged in: ${data.email}`,
          userId: doc.id,
          userEmail: data.email,
          details: {
            lastLogin: data.lastLoginAt,
          },
          timestamp: data.lastLoginAt,
        });
      }
    });

    // Generate application activities
    applicationsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: `app-${doc.id}`,
        type: 'application',
        action: `New application created: ${data.name}`,
        userId: data.ownerId,
        details: {
          appName: data.name,
          appId: doc.id,
        },
        timestamp: data.createdAt,
      });
    });

    // Generate license activities
    licensesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: `license-${doc.id}`,
        type: 'license',
        action: `License created for ${data.appName || 'application'}`,
        userId: data.ownerId,
        details: {
          licenseKey: data.key,
          appId: data.appId,
          expiresAt: data.expiresAt,
        },
        timestamp: data.createdAt,
      });

      if (data.lastVerifiedAt) {
        activities.push({
          id: `license-verify-${doc.id}`,
          type: 'security',
          action: `License verified: ${data.key.substring(0, 10)}...`,
          details: {
            appId: data.appId,
            hwid: data.hwid,
          },
          timestamp: data.lastVerifiedAt,
        });
      }
    });

    // Generate reseller activities
    resellersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      activities.push({
        id: `reseller-${doc.id}`,
        type: 'reseller',
        action: `New reseller created: ${data.name} (${data.email})`,
        userId: data.ownerId,
        details: {
          resellerName: data.name,
          appId: data.appId,
        },
        timestamp: data.createdAt,
      });

      if (data.lastLoginAt) {
        activities.push({
          id: `reseller-login-${doc.id}`,
          type: 'security',
          action: `Reseller logged in: ${data.email}`,
          details: {
            resellerName: data.name,
          },
          timestamp: data.lastLoginAt,
        });
      }
    });

    // Sort by timestamp (newest first)
    activities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      activities: activities.slice(0, 100), // Limit to 100 most recent
    });

  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}


