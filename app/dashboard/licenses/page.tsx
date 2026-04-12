'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface DeviceInfo {
  hwid: string;
  label?: string;
  lockedAt: string;
  lastUsed: string;
  ipAddresses: string[];
}

interface IPRecord {
  ip: string;
  firstSeen: string;
  lastSeen: string;
  country?: string;
  city?: string;
  isp?: string;
  isSuspicious?: boolean;
}

interface LicenseDetails {
  license: {
    id: string;
    key: string;
    appName: string;
    appId: string;
    isActive: boolean;
    createdAt: string;
    expiresAt: string;
    lastUsed?: string;
    maxDevices: number;
  };
  deviceBinding: {
    lockedAt?: string;
    gracePeriodActive: boolean;
    gracePeriodEndsAt?: string;
    authorizedDevices: DeviceInfo[];
    boundDevicesCount: number;
    availableSlots: number;
  };
  ipTracking: {
    totalIPs: number;
    uniqueCountries: number;
    uniqueCities: number;
    ipAddresses: IPRecord[];
  };
  security: {
    suspiciousActivityDetected: boolean;
    suspiciousIPs: IPRecord[];
  };
}

export default function LicenseDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState('');
  const [details, setDetails] = useState<LicenseDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
    } else {
      fetchAllUsers();
      fetchApplications();
    }
  }, [user, router]);

  const fetchLicenseDetails = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setLoading(true);
    setError('');
    setDetails(null);

    try {
      const token = await user?.getIdToken();
      const response = await fetch(
        `/api/admin/license-details?licenseKey=${encodeURIComponent(licenseKey)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDetails(data);
      } else {
        setError(data.error || 'Failed to fetch license details');
      }
    } catch {
      setError('An error occurred while fetching license details');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDevice = async (deviceHWID: string) => {
    if (!confirm('Are you sure you want to unbind this device?')) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/reset-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          licenseKey: licenseKey,
          deviceHWID: deviceHWID,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Device unbound successfully!');
        fetchLicenseDetails();
      } else {
        toast.error(data.error || 'Failed to reset device');
      }
    } catch {
      toast.error('An error occurred while resetting the device');
    }
  };

  const handleResetAllDevices = async () => {
    if (!confirm('Are you sure you want to unbind ALL devices from this license? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/reset-device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          licenseKey: licenseKey,
          resetAll: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('All devices unbound successfully!');
        fetchLicenseDetails();
      } else {
        toast.error(data.error || 'Failed to reset devices');
      }
    } catch {
      toast.error('An error occurred while resetting devices');
    }
  };

  const handleUpdateDeviceLabel = async (deviceHWID: string) => {
    if (!newLabel.trim()) {
      toast.error('Please enter a label');
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/update-device-label', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          licenseKey: licenseKey,
          deviceHWID: deviceHWID,
          label: newLabel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Device label updated successfully!');
        setEditingDeviceId(null);
        setNewLabel('');
        fetchLicenseDetails();
      } else {
        toast.error(data.error || 'Failed to update device label');
      }
    } catch {
      toast.error('An error occurred while updating the device label');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const fetchAllUsers = async () => {
    try {
      const token = await user?.getIdToken();
      
      // Fetch all applications first
      const appsResponse = await fetch('/api/application/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const appsData = await appsResponse.json();
      const apps = appsData.applications || [];
      setApplications(apps);
      
      // Fetch users from all applications
      const allUsers: any[] = [];
      for (const app of apps) {
        const response = await fetch(`/api/user/list?appId=${app.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.users) {
          allUsers.push(...data.users.map((u: any) => ({ ...u, appId: app.id })));
        }
      }
      
      setUsers(allUsers);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/application/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setApplications(data.applications || []);
    } catch {
      console.error('Failed to fetch applications');
    }
  };

  const getAppName = (appId: string) => {
    return applications.find(a => a.id === appId)?.name || 'Unknown';
  };

  // Calculate user statistics for graphs
  const userStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers = users.filter(u => u.lastLogin && new Date(u.lastLogin) > today).length;
    const notLoggedIn = users.filter(u => !u.lastLogin || new Date(u.lastLogin) <= monthAgo).length;
    const expiredUsers = users.filter(u => u.expiresAt && new Date(u.expiresAt) < now).length;
    const activeThisWeek = users.filter(u => u.lastLogin && new Date(u.lastLogin) > weekAgo).length;
    const activeThisMonth = users.filter(u => u.lastLogin && new Date(u.lastLogin) > monthAgo).length;
    const withLicense = users.filter(u => u.licenseKey).length;
    const withoutLicense = users.filter(u => !u.licenseKey).length;
    const bannedUsers = users.filter(u => u.banned).length;
    const pausedUsers = users.filter(u => u.paused).length;
    const hwidLocked = users.filter(u => u.hwidLocked).length;

    // Daily registration (last 30 days)
    const dailyRegistrations: { [key: string]: number } = {};
    users.forEach(user => {
      const date = new Date(user.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      if (date >= monthAgo) {
        dailyRegistrations[dateKey] = (dailyRegistrations[dateKey] || 0) + 1;
      }
    });

    const registrationData = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: dailyRegistrations[dateKey] || 0,
      };
    });

    // Users by application
    const usersByApp: { [key: string]: number } = {};
    users.forEach(user => {
      const appName = getAppName(user.appId);
      usersByApp[appName] = (usersByApp[appName] || 0) + 1;
    });

    const appData = Object.entries(usersByApp)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      activeUsers,
      notLoggedIn,
      expiredUsers,
      activeThisWeek,
      activeThisMonth,
      withLicense,
      withoutLicense,
      bannedUsers,
      pausedUsers,
      hwidLocked,
      registrationData,
      appData,
    };
  }, [users, applications]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              License Details 🔍
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              View devices, IP addresses, and activity for your licenses
            </p>
          </div>
        </ScrollAnimateWrapper>

        {/* 9-Box Matrix - User Statistics */}
        {!usersLoading && users.length > 0 && (
          <ScrollAnimateWrapper animation="scale" delay={100}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                User Statistics Matrix
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {/* Row 1 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{userStats.activeUsers}</p>
                  <p className="text-[10px] text-green-600 dark:text-green-500 mt-1">Logged in today</p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">Not Logged In</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{userStats.notLoggedIn}</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">Over 30 days</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">Expired Users</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{userStats.expiredUsers}</p>
                  <p className="text-[10px] text-red-600 dark:text-red-500 mt-1">License expired</p>
                </div>

                {/* Row 2 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">With License</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{userStats.withLicense}</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-500 mt-1">Have license key</p>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">Without License</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{userStats.withoutLicense}</p>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">No license key</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-medium mb-1">HWID Locked</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{userStats.hwidLocked}</p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-500 mt-1">Device locked</p>
                </div>

                {/* Row 3 */}
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl p-5 border border-cyan-200 dark:border-cyan-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-cyan-700 dark:text-cyan-400 font-medium mb-1">Active This Week</p>
                  <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{userStats.activeThisWeek}</p>
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-500 mt-1">Last 7 days</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium mb-1">Active This Month</p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{userStats.activeThisMonth}</p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mb-1">Banned/Paused</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{userStats.bannedUsers + userStats.pausedUsers}</p>
                  <p className="text-[10px] text-orange-600 dark:text-orange-500 mt-1">Restricted access</p>
                </div>
              </div>
            </div>
          </ScrollAnimateWrapper>
        )}

        {/* Search Section */}
        <ScrollAnimateWrapper animation="slide-right">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter license key..."
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchLicenseDetails()}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
              />
              <button
                onClick={fetchLicenseDetails}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Searching...
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg animate-fadeIn">
                {error}
              </div>
            )}
          </div>
        </ScrollAnimateWrapper>

        {/* License Details */}
        {details && (
          <div className="space-y-6">
            {/* License Info Card */}
            <ScrollAnimateWrapper animation="scale">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{details.license.appName}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      License Key: <code className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded text-slate-800 dark:text-slate-200">{details.license.key}</code>
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    details.license.isActive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                  }`}>
                    {details.license.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(details.license.createdAt)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expires</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(details.license.expiresAt)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Used</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{details.license.lastUsed ? formatDate(details.license.lastUsed) : 'Never'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Device Slots</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{details.deviceBinding.boundDevicesCount} / {details.license.maxDevices}</p>
                  </div>
                </div>

                {/* Suspicious Activity Warning */}
                {details.security.suspiciousActivityDetected && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-yellow-900 dark:text-yellow-200">Suspicious Activity Detected</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">This license has been accessed from multiple geographic locations in a short time period.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grace Period Notice */}
                {details.deviceBinding.gracePeriodActive && details.deviceBinding.gracePeriodEndsAt && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-200">Grace Period Active</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Device changes allowed until {formatDate(details.deviceBinding.gracePeriodEndsAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollAnimateWrapper>

            {/* Bound Devices */}
            <ScrollAnimateWrapper animation="slide-left" delay={100}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bound Devices</h3>
                  {details.deviceBinding.boundDevicesCount > 0 && (
                    <button
                      onClick={handleResetAllDevices}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                    >
                      Reset All Devices
                    </button>
                  )}
                </div>

                {details.deviceBinding.authorizedDevices.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">No devices bound to this license yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {details.deviceBinding.authorizedDevices.map((device, index) => (
                      <div key={device.hwid} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                          <div className="flex-1">
                            {editingDeviceId === device.hwid ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newLabel}
                                  onChange={(e) => setNewLabel(e.target.value)}
                                  placeholder="Enter device name..."
                                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500"
                                />
                                <button
                                  onClick={() => handleUpdateDeviceLabel(device.hwid)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingDeviceId(null);
                                    setNewLabel('');
                                  }}
                                  className="px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                                  {device.label || `Device ${index + 1}`}
                                </h4>
                                <button
                                  onClick={() => {
                                    setEditingDeviceId(device.hwid);
                                    setNewLabel(device.label || '');
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                  title="Edit label"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">HWID: {device.hwid.substring(0, 24)}...</p>
                          </div>
                          <button
                            onClick={() => handleResetDevice(device.hwid)}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                          >
                            Unbind
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">Bound:</span>
                            <p className="text-slate-900 dark:text-white mt-1">{formatDate(device.lockedAt)}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">Last Used:</span>
                            <p className="text-slate-900 dark:text-white mt-1">{formatDate(device.lastUsed)}</p>
                          </div>
                          <div className="col-span-full bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">IP Addresses ({device.ipAddresses.length}):</span>
                            <p className="text-slate-900 dark:text-white mt-1 break-all">{device.ipAddresses.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollAnimateWrapper>

            {/* IP Addresses */}
            <ScrollAnimateWrapper animation="slide-right" delay={200}>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">IP Address Activity</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">Total IPs</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-200 mt-2">{details.ipTracking.totalIPs}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">Countries</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-200 mt-2">{details.ipTracking.uniqueCountries}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-300 font-semibold">Cities</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-200 mt-2">{details.ipTracking.uniqueCities}</p>
                  </div>
                </div>

                {details.ipTracking.ipAddresses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">No IP activity recorded yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6 sm:mx-0">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">IP Address</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">ISP</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">First Seen</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Last Seen</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                          {details.ipTracking.ipAddresses.map((ip) => (
                            <tr key={ip.ip} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                              ip.isSuspicious ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                            }`}>
                              <td className="px-6 py-4 text-sm font-mono text-slate-900 dark:text-white">{ip.ip}</td>
                              <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{ip.city}, {ip.country || 'Unknown'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{ip.isp || '-'}</td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(ip.firstSeen)}</td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(ip.lastSeen)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </ScrollAnimateWrapper>
          </div>
        )}

        {/* User Statistics Graphs */}
        {!usersLoading && users.length > 0 && (
          <ScrollAnimateWrapper animation="fade" delay={300}>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Statistics</h2>
              
              {/* User Status Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Status Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    User Status Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Active', value: userStats.activeUsers, color: '#10b981' },
                          { name: 'Not Logged In', value: userStats.notLoggedIn, color: '#64748b' },
                          { name: 'Expired', value: userStats.expiredUsers, color: '#ef4444' },
                          { name: 'Banned', value: userStats.bannedUsers, color: '#dc2626' },
                          { name: 'Paused', value: userStats.pausedUsers, color: '#f59e0b' },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => {
                          const percent = props.percent as number;
                          const name = props.name as string;
                          return `${name} ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={70}
                        innerRadius={20}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {[
                          { name: 'Active', value: userStats.activeUsers, color: '#10b981' },
                          { name: 'Not Logged In', value: userStats.notLoggedIn, color: '#64748b' },
                          { name: 'Expired', value: userStats.expiredUsers, color: '#ef4444' },
                          { name: 'Banned', value: userStats.bannedUsers, color: '#dc2626' },
                          { name: 'Paused', value: userStats.pausedUsers, color: '#f59e0b' },
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* License & HWID Status */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    License & HWID Status
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'With License', value: userStats.withLicense, color: '#10b981' },
                          { name: 'No License', value: userStats.withoutLicense, color: '#64748b' },
                          { name: 'HWID Locked', value: userStats.hwidLocked, color: '#6366f1' },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => {
                          const percent = props.percent as number;
                          const name = props.name as string;
                          return `${name} ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius={70}
                        innerRadius={25}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {[
                          { name: 'With License', value: userStats.withLicense, color: '#10b981' },
                          { name: 'No License', value: userStats.withoutLicense, color: '#64748b' },
                          { name: 'HWID Locked', value: userStats.hwidLocked, color: '#6366f1' },
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Trends & Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Registration Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Registration Trend (Last 30 Days)
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={userStats.registrationData}>
                      <defs>
                        <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid rgba(226, 232, 240, 0.8)',
                          borderRadius: '8px',
                        }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#6366f1" fillOpacity={1} fill="url(#regGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Activity Status */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Activity Status
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={[
                        { period: 'Today', active: userStats.activeUsers, label: 'Today' },
                        { period: 'Week', active: userStats.activeThisWeek, label: 'This Week' },
                        { period: 'Month', active: userStats.activeThisMonth, label: 'This Month' },
                      ]}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/>
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
                        formatter={(value: unknown, name?: string) => [`${value} users`, 'Active']}
                        labelFormatter={(label) => label}
                        cursor={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="active"
                        stroke="none"
                        fill="url(#activityGradient)"
                        fillOpacity={0.6}
                      />
                      <Line
                        type="monotone"
                        dataKey="active"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', r: 6, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                        animationDuration={2000}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Applications by User Count */}
              {userStats.appData.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Users by Application
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={userStats.appData}
                      layout="vertical"
                      margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="appGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" horizontal={true} vertical={false} />
                      <XAxis
                        type="number"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#64748b"
                        fontSize={11}
                        width={140}
                        tickLine={false}
                        axisLine={false}
                        fontWeight={500}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                        }}
                        formatter={(value: unknown, name?: string) => [`${value} users`, 'Count']}
                        cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                      />
                      <Bar dataKey="count" fill="url(#appGradient)" radius={[0, 12, 12, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.activeUsers}</p>
                  <p className="text-[10px] text-green-600 dark:text-green-500 mt-1">Last 24 hours</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">Not Logged In</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{userStats.notLoggedIn}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">30+ days inactive</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">Expired Users</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{userStats.expiredUsers}</p>
                  <p className="text-[10px] text-red-600 dark:text-red-500 mt-1">License expired</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-1">This Month</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.activeThisMonth}</p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-500 mt-1">Active users</p>
                </div>
              </div>
            </div>
          </ScrollAnimateWrapper>
        )}
      </div>
    </DashboardLayout>
  );
}
