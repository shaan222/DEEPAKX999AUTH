import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * Get Analytics (Admin Only)
 * Returns comprehensive analytics and insights
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

    // Fetch all data
    const [usersSnapshot, applicationsSnapshot, licensesSnapshot, resellersSnapshot] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('applications').get(),
      adminDb.collection('licenses').get(),
      adminDb.collection('resellers').get(),
    ]);

    // Calculate date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User stats
    const totalUsers = usersSnapshot.size;
    const activeUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      if (data.lastLoginAt) {
        return new Date(data.lastLoginAt) > today;
      }
      return false;
    }).length;

    // Growth stats
    const usersToday = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return new Date(data.createdAt) >= today;
    }).length;

    const usersThisWeek = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return new Date(data.createdAt) >= weekAgo;
    }).length;

    const usersThisMonth = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return new Date(data.createdAt) >= monthAgo;
    }).length;

    // License stats
    const totalLicenses = licensesSnapshot.size;
    const activeLicenses = licensesSnapshot.docs.filter((doc) => {
      const data = doc.data();
      if (data.expiresAt === 'never') {
        return true;
      }
      return new Date(data.expiresAt) > now;
    }).length;

    const expiredLicenses = totalLicenses - activeLicenses;

    const licensesToday = licensesSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return new Date(data.createdAt) >= today;
    }).length;

    const licensesThisWeek = licensesSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return new Date(data.createdAt) >= weekAgo;
    }).length;

    const licensesThisMonth = licensesSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return new Date(data.createdAt) >= monthAgo;
    }).length;

    // Application stats with licenses and users count
    const appStats = new Map();
    licensesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const appId = data.appId;
      if (!appStats.has(appId)) {
        appStats.set(appId, {
          appId,
          appName: data.appName,
          licenseCount: 0,
          users: new Set(),
        });
      }
      const stats = appStats.get(appId);
      stats.licenseCount++;
      if (data.userId) {
        stats.users.add(data.userId);
      }
    });

    const topApplications = Array.from(appStats.values())
      .map((stats) => ({
        id: stats.appId,
        name: stats.appName,
        licenseCount: stats.licenseCount,
        userCount: stats.users.size,
      }))
      .sort((a, b) => b.licenseCount - a.licenseCount)
      .slice(0, 10);

    // Reseller stats
    const totalResellers = resellersSnapshot.size;
    const topResellers = resellersSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          totalSales: data.totalSales || 0,
        };
      })
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    // Subscription stats
    const freeUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return !data.subscription || data.subscription.tier === 'free';
    }).length;

    const proUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.subscription && (data.subscription.tier === 'pro' || data.subscription.tier === 'advance');
    }).length;

    const advanceUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.subscription && data.subscription.tier === 'advance';
    }).length;

    // Auth provider stats
    const emailUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return !data.provider || data.provider === 'email';
    }).length;

    const googleUsers = usersSnapshot.docs.filter((doc) => {
      const data = doc.data();
      return data.provider === 'google';
    }).length;

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          activeUsers,
          totalApplications: applicationsSnapshot.size,
          totalLicenses,
          totalResellers,
          activeLicenses,
          expiredLicenses,
        },
        growth: {
          usersToday,
          usersThisWeek,
          usersThisMonth,
          licensesToday,
          licensesThisWeek,
          licensesThisMonth,
        },
        topApplications,
        topResellers,
        subscriptionStats: {
          freeUsers,
          proUsers,
          advanceUsers,
        },
        authProviders: {
          email: emailUsers,
          google: googleUsers,
        },
      },
    });

  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}


