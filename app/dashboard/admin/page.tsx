'use client'

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  totalLicenses: number;
  totalResellers: number;
  totalInviteCodes: number;
  recentUsers: any[];
  recentActivity: any[];
  systemHealth: {
    database: string;
    api: string;
    authentication: string;
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !accessDenied) {
        refreshStats();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, accessDenied]);

  const checkAdminAccess = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (response.ok && data.user && data.user.role === 'admin') {
        fetchStats();
      } else {
        setAccessDenied(true);
        setLoading(false);
      }
    } catch {
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setLastRefresh(new Date());
      } else {
        toast.error(data.error || 'Failed to load admin stats');
      }
    } catch {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshStats = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  // Generate bell curve data (normal distribution)
  const bellCurveData = useMemo(() => {
    if (!stats) {
      return [];
    }
    
    // Generate data points for a normal distribution curve
    const mean = stats.totalUsers / 2; // Mean value
    const stdDev = stats.totalUsers / 4; // Standard deviation
    const dataPoints = [];
    
    // Generate 50 data points from -3σ to +3σ
    for (let i = 0; i <= 50; i++) {
      const x = (i / 50) * stats.totalUsers; // X-axis value (0 to totalUsers)
      const z = (x - mean) / stdDev; // Standardized value
      const y = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI)); // Normal distribution formula
      dataPoints.push({
        value: Math.round(x),
        frequency: y * 1000, // Scale for visualization
        label: i === 0 ? '0' : i === 25 ? Math.round(mean).toString() : i === 50 ? stats.totalUsers.toString() : '',
      });
    }
    
    return dataPoints;
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <div className="p-6 bg-red-100 rounded-full">
          <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 text-lg">Only administrators can access this page.</p>
          <Link 
            href="/dashboard"
            className="mt-6 inline-block px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex-shrink-0">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white truncate">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">System overview and management</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last updated</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{lastRefresh.toLocaleTimeString()}</p>
          </div>
          <button
            onClick={refreshStats}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* System Health */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-1">Database Status</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.systemHealth.database}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                <svg className="w-8 h-8 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-1">API Status</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.systemHealth.api}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                <svg className="w-8 h-8 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-400 mb-1">Authentication</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.systemHealth.authentication}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                <svg className="w-8 h-8 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Users</div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {stats.totalUsers}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {stats.activeUsers} active today
              </p>
              <Link 
                href="/dashboard/admin/users"
                className="mt-4 inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                View all users
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Total Applications */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Applications</div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {stats.totalApplications}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Across all users
              </p>
            </div>
          </div>

          {/* Total Licenses */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-300 dark:from-green-700 dark:to-emerald-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-green-700 dark:text-green-400">Total Licenses</div>
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {stats.totalLicenses}
              </div>
              <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                Active licenses
              </p>
            </div>
          </div>

          {/* Total Resellers */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Resellers</div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {stats.totalResellers}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Active resellers
              </p>
            </div>
          </div>

          {/* Invite Codes */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Invite Codes</div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {stats.totalInviteCodes}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Total created
              </p>
              <Link 
                href="/dashboard/invite-codes"
                className="mt-4 inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                Manage codes
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 rounded-2xl border border-slate-300 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all">
            <div className="mb-4">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Quick Actions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">Admin Tools</p>
            </div>
            <div className="space-y-2">
              <Link 
                href="/dashboard/admin/users"
                className="block w-full px-4 py-2 bg-white dark:bg-slate-600 hover:bg-slate-50 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
              >
                Manage Users
              </Link>
              <Link 
                href="/dashboard/admin/activity"
                className="block w-full px-4 py-2 bg-white dark:bg-slate-600 hover:bg-slate-50 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
              >
                View Activity
              </Link>
              <Link 
                href="/dashboard/admin/analytics"
                className="block w-full px-4 py-2 bg-white dark:bg-slate-600 hover:bg-slate-50 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
              >
                Analytics
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bell Curve Distribution */}
      {stats && bellCurveData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">User Distribution</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Normal distribution visualization</p>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={bellCurveData}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
              <XAxis 
                dataKey="value" 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  const item = bellCurveData.find(d => d.value === value);
                  return item?.label || '';
                }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                }}
                cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                formatter={(value: any, name: any) => [typeof value === 'number' ? value.toFixed(2) : value, 'Frequency']}
                labelFormatter={(label) => `Value: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="frequency"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#bellGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Users */}
      {stats && stats.recentUsers && stats.recentUsers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Users</h2>
              <Link 
                href="/dashboard/admin/users"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {stats.recentUsers.slice(0, 5).map((user: any) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {user.displayName || 'User'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats && stats.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
              <Link 
                href="/dashboard/admin/activity"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 10).map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'user' ? 'bg-slate-100 dark:bg-slate-700' :
                    activity.type === 'license' ? 'bg-green-100 dark:bg-green-900/30' :
                    activity.type === 'application' ? 'bg-slate-100 dark:bg-slate-700' :
                    'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      activity.type === 'user' ? 'text-slate-700 dark:text-slate-300' :
                      activity.type === 'license' ? 'text-green-700 dark:text-green-400' :
                      activity.type === 'application' ? 'text-slate-700 dark:text-slate-300' :
                      'text-slate-700 dark:text-slate-300'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {activity.timestamp ? formatDate(activity.timestamp) : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

