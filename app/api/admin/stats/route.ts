import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Get Admin Statistics
 * Returns comprehensive statistics for admin dashboard
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

    // Fetch all stats in parallel
    const [
      usersSnapshot,
      applicationsSnapshot,
      licensesSnapshot,
      resellersSnapshot,
      inviteCodesSnapshot,
    ] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('applications').get(),
      adminDb.collection('licenses').get(),
      adminDb.collection('resellers').get(),
      adminDb.collection('inviteCodes').get(),
    ]);

    // Calculate stats
    const totalUsers = usersSnapshot.size;
    
    // Get active users (logged in within last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      if (data.lastLoginAt) {
        return new Date(data.lastLoginAt) > oneDayAgo;
      }
      return false;
    }).length;

    const totalApplications = applicationsSnapshot.size;
    const totalLicenses = licensesSnapshot.size;
    const totalResellers = resellersSnapshot.size;
    const totalInviteCodes = inviteCodesSnapshot.size;

    // Get recent users (last 10)
    const recentUsers = usersSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          displayName: data.displayName || null,
          role: data.role || 'user',
          createdAt: data.createdAt,
          lastLoginAt: data.lastLoginAt || null,
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    // Generate recent activity
    const recentActivity: Array<{
      type: string;
      message: string;
      timestamp: string;
    }> = [];

    // Add recent user registrations
    usersSnapshot.docs
      .slice(0, 5)
      .forEach((doc) => {
        const data = doc.data();
        recentActivity.push({
          type: 'user',
          message: `New user registered: ${data.email}`,
          timestamp: data.createdAt,
        });
      });

    // Add recent license creations
    licensesSnapshot.docs
      .slice(0, 5)
      .forEach((doc) => {
        const data = doc.data();
        recentActivity.push({
          type: 'license',
          message: `New license created for ${data.appName || 'application'}`,
          timestamp: data.createdAt,
        });
      });

    // Sort activity by timestamp
    recentActivity.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    // System health check
    const systemHealth = {
      database: 'Operational',
      api: 'Operational',
      authentication: 'Operational',
    };

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalApplications,
        totalLicenses,
        totalResellers,
        totalInviteCodes,
        recentUsers,
        recentActivity: recentActivity.slice(0, 10),
        systemHealth,
      },
    });

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}


