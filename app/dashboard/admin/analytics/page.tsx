'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface Analytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalApplications: number;
    totalLicenses: number;
    totalResellers: number;
    activeLicenses: number;
    expiredLicenses: number;
  };
  growth: {
    usersToday: number;
    usersThisWeek: number;
    usersThisMonth: number;
    licensesToday: number;
    licensesThisWeek: number;
    licensesThisMonth: number;
  };
  topApplications: Array<{
    id: string;
    name: string;
    licenseCount: number;
    userCount: number;
  }>;
  topResellers: Array<{
    id: string;
    name: string;
    email: string;
    totalSales: number;
  }>;
  subscriptionStats: {
    freeUsers: number;
    proUsers: number;
  };
  authProviders: {
    email: number;
    google: number;
  };
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
        fetchAnalytics();
      } else {
        setAccessDenied(true);
        setLoading(false);
      }
    } catch {
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.analytics);
      } else {
        toast.error(data.error || 'Failed to load analytics');
      }
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) {
      return 0;
    }
    return Math.round((part / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link 
            href="/dashboard/admin"
            className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Insights</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive system analytics and metrics</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">System Overview</h2>
        
        {/* 9-Box Matrix - System Analytics */}
        {analytics && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics Matrix
            </h3>
          <div className="grid grid-cols-3 gap-4">
            {/* Row 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">Total Users</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{analytics.overview.totalUsers}</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-500 mt-1">All registered</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Active Users</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{analytics.overview.activeUsers}</p>
              <p className="text-[10px] text-green-600 dark:text-green-500 mt-1">Currently active</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-400 font-medium mb-1">Applications</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{analytics.overview.totalApplications}</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-500 mt-1">Total created</p>
            </div>

            {/* Row 2 */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-5 border border-teal-200 dark:border-teal-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <p className="text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">Total Licenses</p>
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{analytics.overview.totalLicenses}</p>
              <p className="text-[10px] text-teal-600 dark:text-teal-500 mt-1">All licenses</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">Active Licenses</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.overview.activeLicenses}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-1">Currently active</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">Expired Licenses</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{analytics.overview.expiredLicenses}</p>
              <p className="text-[10px] text-red-600 dark:text-red-500 mt-1">License expired</p>
            </div>

            {/* Row 3 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">Resellers</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{analytics.overview.totalResellers}</p>
              <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">Active resellers</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium mb-1">Growth Today</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{analytics.growth.usersToday + analytics.growth.licensesToday}</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-500 mt-1">Users + Licenses</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-5 border border-pink-200 dark:border-pink-800 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-2">
                <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs text-pink-700 dark:text-pink-400 font-medium mb-1">Growth This Month</p>
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{analytics.growth.usersThisMonth + analytics.growth.licensesThisMonth}</p>
              <p className="text-[10px] text-pink-600 dark:text-pink-500 mt-1">Users + Licenses</p>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Growth Metrics with Enhanced Charts */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Growth Metrics</h2>
        
        {/* Combined Growth Comparison Chart */}
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Growth Comparison
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Users vs Licenses growth over time</p>
              </div>
              
              {/* Stats Cards */}
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Users</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{analytics.growth.usersThisMonth}</p>
                  <p className="text-[10px] text-blue-500 dark:text-blue-500">This Month</p>
                </div>
                <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Licenses</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">{analytics.growth.licensesThisMonth}</p>
                  <p className="text-[10px] text-green-500 dark:text-green-500">This Month</p>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={[
                  { 
                    period: 'Today', 
                    users: analytics.growth.usersToday, 
                    licenses: analytics.growth.licensesToday,
                    periodShort: 'Today'
                  },
                  { 
                    period: 'This Week', 
                    users: analytics.growth.usersThisWeek, 
                    licenses: analytics.growth.licensesThisWeek,
                    periodShort: 'Week'
                  },
                  { 
                    period: 'This Month', 
                    users: analytics.growth.usersThisMonth, 
                    licenses: analytics.growth.licensesThisMonth,
                    periodShort: 'Month'
                  },
                ]}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorLicenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                <XAxis 
                  dataKey="period" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                  formatter={(value: unknown, name: string) => {
                    const label = name === 'users' ? 'Users' : 'Licenses';
                    return [`${value} ${label}`, label];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)"
                  name="users"
                />
                <Area 
                  type="monotone" 
                  dataKey="licenses" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorLicenses)"
                  name="licenses"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Licenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Growth Cards - Redesigned */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Detailed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">User Growth</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">New registrations</p>
                  </div>
                </div>
              </div>

              {/* Large Stats Display */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{analytics.growth.usersThisMonth}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">this month</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">Today:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{analytics.growth.usersToday}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">Week:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{analytics.growth.usersThisWeek}</span>
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={[
                    { period: 'Today', value: analytics.growth.usersToday, label: 'Today' },
                    { period: 'Week', value: analytics.growth.usersThisWeek, label: 'This Week' },
                    { period: 'Month', value: analytics.growth.usersThisMonth, label: 'This Month' },
                  ]}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="userLineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={500}
                    tick={{ fill: '#64748b' }}
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
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    }}
                    formatter={(value: unknown) => [`${value} users`, '']}
                    labelFormatter={(label) => label}
                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="none"
                    fill="url(#userLineGradient)"
                    fillOpacity={0.6}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    dot={{ fill: '#6366f1', r: 6, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* License Growth Detailed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-400/5 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">License Growth</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">New licenses</p>
                  </div>
                </div>
              </div>

              {/* Large Stats Display */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-green-600 dark:text-green-400">{analytics.growth.licensesThisMonth}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">this month</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">Today:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{analytics.growth.licensesToday}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">Week:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{analytics.growth.licensesThisWeek}</span>
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={[
                    { period: 'Today', value: analytics.growth.licensesToday, label: 'Today' },
                    { period: 'Week', value: analytics.growth.licensesThisWeek, label: 'This Week' },
                    { period: 'Month', value: analytics.growth.licensesThisMonth, label: 'This Month' },
                  ]}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="licenseLineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis 
                    dataKey="period" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    fontWeight={500}
                    tick={{ fill: '#64748b' }}
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
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    }}
                    formatter={(value: unknown) => [`${value} licenses`, '']}
                    labelFormatter={(label) => label}
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="none"
                    fill="url(#licenseLineGradient)"
                    fillOpacity={0.6}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={4}
                    dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription & Auth Stats with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Subscription Distribution</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.subscriptionStats.freeUsers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Free Plan</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {calculatePercentage(analytics.subscriptionStats.freeUsers, analytics.overview.totalUsers)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.subscriptionStats.proUsers}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pro Plan</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {calculatePercentage(analytics.subscriptionStats.proUsers, analytics.overview.totalUsers)}%
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Free', value: analytics.subscriptionStats.freeUsers, color: '#64748b' },
                  { name: 'Pro', value: analytics.subscriptionStats.proUsers, color: '#10b981' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const percent = props.percent as number;
                  const name = props.name as string;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#64748b" />
                <Cell fill="#10b981" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Auth Providers Pie Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Authentication Providers</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{analytics.authProviders.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email/Password</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {calculatePercentage(analytics.authProviders.email, analytics.overview.totalUsers)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.authProviders.google}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {calculatePercentage(analytics.authProviders.google, analytics.overview.totalUsers)}%
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Email', value: analytics.authProviders.email, color: '#64748b' },
                  { name: 'Google', value: analytics.authProviders.google, color: '#34a853' },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const percent = props.percent as number;
                  const name = props.name as string;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#64748b" />
                <Cell fill="#34a853" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Applications Chart */}
      {analytics.topApplications.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Top Applications by License Count</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analytics.topApplications.slice(0, 10)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#64748b"
                fontSize={11}
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '8px',
                }}
                formatter={(value: unknown) => [`${value} licenses`, 'Count']}
              />
              <Bar dataKey="licenseCount" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Applications Table (Detailed View) */}
      {analytics.topApplications.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top Applications Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Application</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Licenses</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {analytics.topApplications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{app.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{app.licenseCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{app.userCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Resellers */}
      {analytics.topResellers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top Resellers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Reseller</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {analytics.topResellers.map((reseller, index) => (
                  <tr key={reseller.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-slate-400 dark:text-slate-500">#{index + 1}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{reseller.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{reseller.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">{reseller.totalSales} licenses</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* License Health */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">License Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Active Licenses</p>
            <p className="text-3xl font-bold text-green-900 dark:text-green-400">{analytics.overview.activeLicenses}</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">
              {calculatePercentage(analytics.overview.activeLicenses, analytics.overview.totalLicenses)}% of total
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">Expired Licenses</p>
            <p className="text-3xl font-bold text-red-900 dark:text-red-400">{analytics.overview.expiredLicenses}</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
              {calculatePercentage(analytics.overview.expiredLicenses, analytics.overview.totalLicenses)}% of total
            </p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">Total Licenses</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{analytics.overview.totalLicenses}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">All time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

