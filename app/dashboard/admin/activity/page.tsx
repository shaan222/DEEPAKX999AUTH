'use client'

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Activity {
  id: string;
  type: string;
  action: string;
  userId?: string;
  userEmail?: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

const COLORS = {
  user: '#64748b',
  license: '#10b981',
  application: '#475569',
  reseller: '#6366f1',
  security: '#ef4444',
};

export default function AdminActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'both'>('both');

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !accessDenied) {
        refreshActivities();
      }
    }, 10000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        fetchActivities();
      } else {
        setAccessDenied(true);
        setLoading(false);
      }
    } catch {
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/activity', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setActivities(data.activities);
        setLastRefresh(new Date());
      } else {
        toast.error(data.error || 'Failed to load activities');
      }
    } catch {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshActivities = async () => {
    setRefreshing(true);
    await fetchActivities();
  };

  const filteredActivities = filterType === 'all' 
    ? activities 
    : activities.filter(a => a.type === filterType);

  // Data processing for graphs
  const graphData = useMemo(() => {
    try {
      // Ensure activities is an array
      const safeActivities = Array.isArray(activities) ? activities : [];

      // Activity by type (for pie chart)
      const activityByType = safeActivities.reduce((acc: Record<string, number>, activity) => {
        if (activity && activity.type) {
          acc[activity.type] = (acc[activity.type] || 0) + 1;
        }
        return acc;
      }, {});

      const pieData = Object.entries(activityByType).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        fill: COLORS[name as keyof typeof COLORS] || '#64748b',
      }));

      // Enhanced Hourly distribution (last 24 hours) with type breakdown
      const hourlyData: { [key: number]: { total: number; [key: string]: number } } = {};
      const now = new Date();
      const last24Hours = safeActivities.filter(a => {
        if (!a || !a.timestamp) {
          return false;
        }
        const activityDate = new Date(a.timestamp);
        return !isNaN(activityDate.getTime()) && activityDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
      });

      last24Hours.forEach(activity => {
        if (!activity || !activity.timestamp) {
          return;
        }
        const activityDate = new Date(activity.timestamp);
        if (isNaN(activityDate.getTime())) {
          return;
        }
        const hour = activityDate.getHours();
        if (hour >= 0 && hour < 24) {
          if (!hourlyData[hour]) {
            hourlyData[hour] = { total: 0, user: 0, license: 0, application: 0, reseller: 0, security: 0 };
          }
          hourlyData[hour].total += 1;
          if (activity.type) {
            hourlyData[hour][activity.type] = (hourlyData[hour][activity.type] || 0) + 1;
          }
        }
      });

      const hourlyChartData = Array.from({ length: 24 }, (_, i) => {
        const data = hourlyData[i] || { total: 0, user: 0, license: 0, application: 0, reseller: 0, security: 0 };
        const hourLabel = i.toString().padStart(2, '0') + ':00';
        const isCurrentHour = i === now.getHours();
        return {
          hour: hourLabel,
          hourNum: i,
          value: data.total,
          user: data.user || 0,
          license: data.license || 0,
          application: data.application || 0,
          reseller: data.reseller || 0,
          security: data.security || 0,
          isCurrentHour,
          isPast: i < now.getHours(),
          isFuture: i > now.getHours(),
        };
      });

      // Calculate hourly statistics
      const hourlyStats = {
        total: last24Hours.length,
        peakHour: hourlyChartData.length > 0 ? hourlyChartData.reduce((max, item) => item.value > max.value ? item : max, hourlyChartData[0]) : { hour: '00:00', value: 0 },
        average: Math.round(last24Hours.length / 24),
        currentHourActivity: hourlyData[now.getHours()]?.total || 0,
      };

    // Calculate insights and improvements
    const insights = (() => {
      const recommendations: Array<{ type: 'info' | 'warning' | 'success'; message: string }> = [];

      try {
        // Activity distribution analysis
        const totalActivities = safeActivities.length || 0;
        if (totalActivities === 0) {
          return {
            recommendations: [],
            typeDistribution: {
              user: 0,
              license: 0,
              security: 0,
            },
          };
        }

        const typeDistribution = safeActivities.reduce((acc: Record<string, number>, a) => {
          if (a && a.type) {
            acc[a.type] = (acc[a.type] || 0) + 1;
          }
          return acc;
        }, {});

        const userPercentage = totalActivities > 0 ? ((typeDistribution.user || 0) / totalActivities) * 100 : 0;
        const licensePercentage = totalActivities > 0 ? ((typeDistribution.license || 0) / totalActivities) * 100 : 0;
        const securityPercentage = totalActivities > 0 ? ((typeDistribution.security || 0) / totalActivities) * 100 : 0;

        // Low activity periods
        if (hourlyChartData && hourlyChartData.length > 0 && hourlyStats && hourlyStats.average > 0) {
          const lowActivityHours = hourlyChartData.filter(h => h.isPast && h.value < hourlyStats.average * 0.5);
          if (lowActivityHours.length > 0) {
            recommendations.push({
              type: 'info',
              message: `${lowActivityHours.length} hours with below-average activity. Consider optimizing during these periods.`
            });
          }
        }

        // High security events
        if (securityPercentage > 15) {
          recommendations.push({
            type: 'warning',
            message: `High security events (${securityPercentage.toFixed(1)}%). Review authentication patterns.`
          });
        }

        // License activity
        if (licensePercentage < 20 && totalActivities > 10) {
          recommendations.push({
            type: 'info',
            message: `Low license activity (${licensePercentage.toFixed(1)}%). Consider promoting license features.`
          });
        }

        // Peak hour optimization
        if (hourlyStats && hourlyStats.peakHour && hourlyStats.average > 0) {
          if (hourlyStats.peakHour.value > hourlyStats.average * 2) {
            recommendations.push({
              type: 'success',
              message: `Peak hour identified: ${hourlyStats.peakHour.hour} (${hourlyStats.peakHour.value} events). Plan scaling accordingly.`
            });
          }
        }

        // Activity trends
        const recentActivity = safeActivities.filter(a => {
          if (!a || !a.timestamp) {
            return false;
          }
          const activityDate = new Date(a.timestamp);
          return !isNaN(activityDate.getTime()) && activityDate >= new Date(now.getTime() - 2 * 60 * 60 * 1000);
        }).length;
        
        const previousActivity = safeActivities.filter(a => {
          if (!a || !a.timestamp) {
            return false;
          }
          const activityDate = new Date(a.timestamp);
          return !isNaN(activityDate.getTime()) && 
                 activityDate >= new Date(now.getTime() - 4 * 60 * 60 * 1000) && 
                 activityDate < new Date(now.getTime() - 2 * 60 * 60 * 1000);
        }).length;

        if (recentActivity > previousActivity * 1.5 && previousActivity > 0) {
          recommendations.push({
            type: 'success',
            message: `Activity increased ${((recentActivity / previousActivity - 1) * 100).toFixed(0)}% in last 2 hours. Trending upward.`
          });
        } else if (recentActivity < previousActivity * 0.7 && previousActivity > 0) {
          recommendations.push({
            type: 'info',
            message: `Activity decreased ${((1 - recentActivity / previousActivity) * 100).toFixed(0)}% in last 2 hours.`
          });
        }

        return {
          recommendations,
          typeDistribution: {
            user: userPercentage,
            license: licensePercentage,
            security: securityPercentage,
          },
        };
      } catch (error) {
        console.error('Error calculating insights:', error);
        return {
          recommendations: [],
          typeDistribution: {
            user: 0,
            license: 0,
            security: 0,
          },
        };
      }
    })();

      // Daily activity (last 7 days)
      const dailyData: { [key: string]: number } = {};
      const last7Days = safeActivities.filter(a => {
        if (!a || !a.timestamp) {
          return false;
        }
        const activityDate = new Date(a.timestamp);
        return !isNaN(activityDate.getTime()) && activityDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      });

      last7Days.forEach(activity => {
        if (!activity || !activity.timestamp) {
          return;
        }
        const date = new Date(activity.timestamp);
        if (isNaN(date.getTime())) {
          return;
        }
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
      });

      const dailyChartData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: dailyData[dateKey] || 0,
        };
      });

      // Activity timeline by type (last 7 days)
      const timelineData: { [key: string]: { [key: string]: number } } = {};
      last7Days.forEach(activity => {
        if (!activity || !activity.timestamp || !activity.type) {
          return;
        }
        const date = new Date(activity.timestamp);
        if (isNaN(date.getTime())) {
          return;
        }
        const dateKey = date.toISOString().split('T')[0];
        if (!timelineData[dateKey]) {
          timelineData[dateKey] = { user: 0, license: 0, application: 0, reseller: 0, security: 0 };
        }
        timelineData[dateKey][activity.type] = (timelineData[dateKey][activity.type] || 0) + 1;
      });

      const timelineChartData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          ...(timelineData[dateKey] || { user: 0, license: 0, application: 0, reseller: 0, security: 0 }),
        };
      });

      // Top users by activity with detailed breakdown
      const userActivity: { [key: string]: { total: number; types: { [key: string]: number } } } = {};
      safeActivities.forEach(activity => {
        if (activity && activity.userEmail) {
          if (!userActivity[activity.userEmail]) {
            userActivity[activity.userEmail] = { total: 0, types: {} };
          }
          userActivity[activity.userEmail].total += 1;
          if (activity.type) {
            userActivity[activity.userEmail].types[activity.type] = (userActivity[activity.userEmail].types[activity.type] || 0) + 1;
          }
        }
      });

      const totalUserActivity = Object.values(userActivity).reduce((sum, user) => sum + user.total, 0);
      const topUsersData = Object.entries(userActivity)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 10)
        .map(([email, data], index) => ({
          email,
          displayEmail: email.length > 25 ? email.substring(0, 25) + '...' : email,
          count: data.total,
          percentage: totalUserActivity > 0 ? ((data.total / totalUserActivity) * 100).toFixed(1) : '0',
          rank: index + 1,
          initials: email.charAt(0).toUpperCase() + (email.includes('@') ? email.split('@')[0].charAt(1).toUpperCase() : ''),
          types: data.types,
        }));

      return {
        pieData,
        hourlyChartData,
        hourlyStats,
        dailyChartData,
        timelineChartData,
        topUsersData,
        insights,
      };
    } catch (error) {
      console.error('Error processing graph data:', error);
      // Return empty/default data on error
      return {
        pieData: [],
        hourlyChartData: [],
        hourlyStats: {
          total: 0,
          peakHour: { hour: '00:00', value: 0 },
          average: 0,
          currentHourActivity: 0,
        },
        dailyChartData: [],
        timelineChartData: [],
        topUsersData: [],
        insights: {
          recommendations: [],
          typeDistribution: {
            user: 0,
            license: 0,
            security: 0,
          },
        },
      };
    }
  }, [activities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'license':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case 'application':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'reseller':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'security':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'license': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'application': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'reseller': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      case 'security': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
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
        <div className="p-4 bg-red-100 rounded-full">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Activity</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time system events and user actions</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'graph'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Graphs
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'both'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Both
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600 dark:text-slate-400">Last updated</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">{lastRefresh.toLocaleTimeString()}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">● Live (auto-refresh: 10s)</p>
          </div>
          <button
            onClick={refreshActivities}
            disabled={refreshing}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">All Activity</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activities.length}</p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">User Events</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {activities.filter(a => a.type === 'user').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-700 dark:text-green-400">License Events</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {activities.filter(a => a.type === 'license').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">App Events</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {activities.filter(a => a.type === 'application').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl shadow-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400">Security Events</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {activities.filter(a => a.type === 'security').length}
          </p>
        </div>
      </div>

      {/* Graphs Section */}
      {(viewMode === 'graph' || viewMode === 'both') && (
        <div className="space-y-6">
          {/* Graph Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Distribution Pie Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Activity Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={graphData.pieData}
                    cx="50%"
                    cy="50%"
                    label={false}
                    outerRadius={70}
                    innerRadius={20}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {graphData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '8px',
                      padding: '8px',
                    }}
                    formatter={(value: unknown) => [String(value), 'Count']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Enhanced Hourly Activity Bar Chart */}
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
              
              {/* Header with Stats */}
              <div className="relative z-10 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Hourly Activity
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Last 24 Hours</p>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-700 dark:text-green-400">Live</span>
                  </div>
                </div>

                {/* Compact Statistics Cards */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Total</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{graphData.hourlyStats.total}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Peak</p>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{graphData.hourlyStats.peakHour.hour}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{graphData.hourlyStats.peakHour.value}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Current</p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{graphData.hourlyStats.currentHourActivity}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Avg</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{graphData.hourlyStats.average}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Chart */}
              <div className="relative z-10">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart 
                    data={graphData.hourlyChartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                    barCategoryGap="8%"
                  >
                    <defs>
                      <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                        <stop offset="50%" stopColor="#6366f1" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="currentHourGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="pastHourGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#64748b" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#475569" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(148, 163, 184, 0.2)" 
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#64748b" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b' }}
                      interval={1}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#64748b' }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        borderRadius: '12px',
                        padding: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      formatter={(value: unknown, name: string) => {
                        if (name === 'value') {
                          return [String(value), 'Total Events'];
                        }
                        return [String(value), name.charAt(0).toUpperCase() + name.slice(1)];
                      }}
                      labelFormatter={(label) => `Hour: ${label}`}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 border border-slate-200 dark:border-slate-700">
                              <p className="font-bold text-slate-900 dark:text-white mb-3">{data.hour}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">{data.value}</span>
                                </div>
                                {data.user > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">User:</span>
                                    <span className="text-sm font-semibold" style={{ color: COLORS.user }}>{data.user}</span>
                                  </div>
                                )}
                                {data.license > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">License:</span>
                                    <span className="text-sm font-semibold" style={{ color: COLORS.license }}>{data.license}</span>
                                  </div>
                                )}
                                {data.application > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Application:</span>
                                    <span className="text-sm font-semibold" style={{ color: COLORS.application }}>{data.application}</span>
                                  </div>
                                )}
                                {data.reseller > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Reseller:</span>
                                    <span className="text-sm font-semibold" style={{ color: COLORS.reseller }}>{data.reseller}</span>
                                  </div>
                                )}
                                {data.security > 0 && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">Security:</span>
                                    <span className="text-sm font-semibold" style={{ color: COLORS.security }}>{data.security}</span>
                                  </div>
                                )}
                                {data.isCurrentHour && (
                                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">● Current Hour</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[12, 12, 0, 0]}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {graphData.hourlyChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={
                            entry.isCurrentHour 
                              ? 'url(#currentHourGradient)'
                              : entry.isPast 
                              ? 'url(#hourlyGradient)'
                              : 'url(#pastHourGradient)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Compact Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-purple-500"></div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">Past</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-green-500 to-emerald-500"></div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">Current</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-slate-400 to-slate-500 opacity-50"></div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400">Future</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Activity Trend Area Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Daily Activity Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Last 7 Days</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={graphData.dailyChartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Timeline by Type */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Activity Timeline by Type</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Last 7 Days</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={graphData.timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="user" stroke={COLORS.user} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="license" stroke={COLORS.license} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="application" stroke={COLORS.application} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="reseller" stroke={COLORS.reseller} strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="security" stroke={COLORS.security} strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights & Improvements */}
          {graphData.insights.recommendations.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg border border-blue-200 dark:border-blue-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Insights & Improvements</h3>
              </div>
              <div className="space-y-2">
                {graphData.insights.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      rec.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : rec.type === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className={`mt-0.5 ${
                      rec.type === 'success' ? 'text-green-600 dark:text-green-400' :
                      rec.type === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {rec.type === 'success' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : rec.type === 'warning' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-sm ${
                      rec.type === 'success' ? 'text-green-800 dark:text-green-300' :
                      rec.type === 'warning' ? 'text-amber-800 dark:text-amber-300' :
                      'text-blue-800 dark:text-blue-300'
                    }`}>
                      {rec.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Users by Activity - Enhanced */}
          {graphData.topUsersData.length > 0 && (
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/20 dark:bg-slate-700/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Top Active Users
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Most active users by total activity count</p>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{graphData.topUsersData.length} Users</span>
                  </div>
                </div>

                {/* User List with Rankings */}
                <div className="space-y-3 mb-6">
                  {graphData.topUsersData.slice(0, 5).map((user, index) => {
                    const maxCount = graphData.topUsersData[0]?.count || 1;
                    const percentage = (user.count / maxCount) * 100;
                    const rankColors = [
                      'bg-blue-500',
                      'bg-amber-400',
                      'bg-orange-500',
                      'bg-red-500',
                      'bg-blue-400',
                    ];
                    
                    return (
                      <div
                        key={user.email}
                        className="group bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:border-slate-300 dark:hover:border-slate-600"
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div className={`w-12 h-12 rounded-xl ${rankColors[index] || 'bg-blue-500'} flex items-center justify-center shadow-md flex-shrink-0`}>
                            <span className="text-white font-bold text-lg">#{user.rank}</span>
                          </div>

                          {/* User Avatar */}
                          <div className="w-12 h-12 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="text-white font-bold text-sm">{user.initials}</span>
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate" title={user.email}>
                              {user.displayEmail}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400">{user.count} activities</span>
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{user.percentage}% of total</span>
                            </div>
                            
                            {/* Activity Type Breakdown */}
                            {Object.keys(user.types).length > 0 && (
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {Object.entries(user.types).map(([type, count]) => (
                                  <span
                                    key={type}
                                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      backgroundColor: `${COLORS[type as keyof typeof COLORS] || '#64748b'}20`,
                                      color: COLORS[type as keyof typeof COLORS] || '#64748b',
                                    }}
                                  >
                                    {type} ({count})
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Activity Count */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.count}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">events</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${rankColors[index] || 'bg-slate-500'} transition-all duration-500 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart View */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Activity Visualization</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={graphData.topUsersData}
                      layout="vertical"
                      margin={{ top: 10, right: 40, left: 180, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" horizontal={true} vertical={false} />
                      <XAxis 
                        type="number" 
                        stroke="#94a3b8" 
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toString()}
                      />
                      <YAxis
                        dataKey="displayEmail"
                        type="category"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        width={170}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                        cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                        formatter={(value: unknown) => [`${value}`, 'Activities']}
                        labelFormatter={(label) => label}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={500}
                      >
                        {graphData.topUsersData.map((entry, index) => {
                          // Professional color scheme: light blue, yellow, orange, red shades
                          const colors = [
                            '#3b82f6', // blue-500
                            '#fbbf24', // amber-400
                            '#f97316', // orange-500
                            '#ef4444', // red-500
                            '#60a5fa', // blue-400
                          ];
                          const opacity = 0.75;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[index % colors.length]} 
                              fillOpacity={opacity}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Additional Users (if more than 5) */}
                {graphData.topUsersData.length > 5 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {graphData.topUsersData.slice(5).map((user) => (
                        <div
                          key={user.email}
                          className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 text-center hover:shadow-md transition-all"
                        >
                          <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">{user.initials}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate mb-1" title={user.email}>
                            {user.displayEmail.split('@')[0]}
                          </p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{user.count}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">#{user.rank}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {(viewMode === 'list' || viewMode === 'both') && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="user">User Events</option>
            <option value="license">License Events</option>
            <option value="application">Application Events</option>
            <option value="reseller">Reseller Events</option>
            <option value="security">Security Events</option>
          </select>
        </div>
      )}

      {/* Activity Feed */}
      {(viewMode === 'list' || viewMode === 'both') && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="p-6">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-slate-500 dark:text-slate-400">No activity found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{activity.action}</p>
                          {activity.userEmail && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">by {activity.userEmail}</p>
                          )}
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300 font-mono">
                              {JSON.stringify(activity.details, null, 2)}
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          activity.type === 'user' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                          activity.type === 'license' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          activity.type === 'application' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                          activity.type === 'reseller' ? 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                          activity.type === 'security' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                          'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        }`}>
                          {activity.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatDate(activity.timestamp)}</span>
                        {activity.ipAddress && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            {activity.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
