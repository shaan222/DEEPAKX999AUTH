'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate, isLicenseExpired } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';
import RankProgression from '@/components/RankProgression';
import { useCountUp } from '@/hooks/useCountUp';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface License {
  id: string;
  key: string;
  appName: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
  maxDevices: number;
  currentDevices: string[];
  lastUsed?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const [maxDevices, setMaxDevices] = useState('1');
  const [creating, setCreating] = useState(false);

  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    fetchApplications();
    fetchLicenses();
  }, []);

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
      if (data.applications && data.applications.length > 0) {
        setSelectedAppId(data.applications[0].id);
      }
    } catch {
      toast.error('Failed to fetch applications');
    }
  };

  const fetchLicenses = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/license/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLicenses(data.licenses || []);
    } catch {
      toast.error('Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppId) {
      toast.error('Please select an application');
      return;
    }

    setCreating(true);

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/license/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: selectedAppId,
          expiryDays: parseInt(expiryDays),
          maxDevices: parseInt(maxDevices),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('License created successfully!');
        setShowCreateModal(false);
        setExpiryDays('30');
        setMaxDevices('1');
        fetchLicenses();
      } else {
        toast.error(data.error || 'Failed to create license');
      }
    } catch {
      toast.error('Failed to create license');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLicense = async (licenseId: string) => {
    if (!confirm('Are you sure you want to delete this license?')) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/license/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ licenseId }),
      });

      if (response.ok) {
        toast.success('License deleted');
        fetchLicenses();
      } else {
        toast.error('Failed to delete license');
      }
    } catch {
      toast.error('Failed to delete license');
    }
  };

  const handleToggleLicense = async (licenseId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/license/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ licenseId }),
      });

      if (response.ok) {
        toast.success('License status updated');
        fetchLicenses();
      } else {
        toast.error('Failed to update license');
      }
    } catch {
      toast.error('Failed to update license');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const stats = {
    total: licenses.length,
    active: licenses.filter((l) => l.isActive && !isLicenseExpired(l.expiresAt)).length,
    expired: licenses.filter((l) => isLicenseExpired(l.expiresAt)).length,
  };

  // Animated counters
  const animatedTotal = useCountUp(stats.total, 1500, statsVisible);
  const animatedActive = useCountUp(stats.active, 1500, statsVisible);
  const animatedExpired = useCountUp(stats.expired, 1500, statsVisible);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Welcome back{user?.displayName ? `, ${user.displayName}` : ''}! 👋
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Here's what's happening with your licenses today.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/applications"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Apps
              </Link>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Stats Cards */}
        <div ref={statsRef} className="grid md:grid-cols-3 gap-6">
          <ScrollAnimateWrapper animation="scale" delay={100}>
            <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover-lift">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Licenses</div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {animatedTotal}
                </div>
              </div>
            </div>
          </ScrollAnimateWrapper>

          <ScrollAnimateWrapper animation="scale" delay={200}>
            <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all hover-lift">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-300 dark:from-green-700 dark:to-emerald-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400">Active Licenses</div>
                </div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                  {animatedActive}
                </div>
              </div>
            </div>
          </ScrollAnimateWrapper>

          <ScrollAnimateWrapper animation="scale" delay={300}>
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all hover-lift">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200 to-orange-300 dark:from-red-700 dark:to-orange-600 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-700 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-red-700 dark:text-red-400">Expired Licenses</div>
                </div>
                <div className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {animatedExpired}
                </div>
              </div>
            </div>
          </ScrollAnimateWrapper>
        </div>

        {/* Rank Progression */}
        <ScrollAnimateWrapper animation="fade" delay={300}>
          <RankProgression />
        </ScrollAnimateWrapper>

        {/* Action Button */}
        <ScrollAnimateWrapper animation="slide-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-slate-300 dark:border-slate-600">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Quick Actions</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {applications.length === 0 ? (
                  <>
                    <Link href="/dashboard/applications" className="font-semibold text-slate-900 dark:text-white hover:underline">
                      Create an application
                    </Link>{' '}
                    first to generate license keys
                  </>
                ) : (
                  'Create a new license key for your applications'
                )}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={applications.length === 0}
              className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create License
            </button>
          </div>
        </ScrollAnimateWrapper>

        {/* Licenses Table */}
        <ScrollAnimateWrapper animation="fade" delay={100}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Licenses</h2>
            </div>
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading licenses...</p>
              </div>
            ) : licenses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No licenses yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Create your first license to get started!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  disabled={applications.length === 0}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Your First License
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        App Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        License Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Devices
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {licenses.map((license) => {
                      const expired = isLicenseExpired(license.expiresAt);
                      return (
                        <tr key={license.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {license.appName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-md font-mono">
                                {license.key}
                              </code>
                              <button
                                onClick={() => copyToClipboard(license.key)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                title="Copy"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {expired ? (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                Expired
                              </span>
                            ) : license.isActive ? (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {license.currentDevices?.length || 0} / {license.maxDevices}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(license.expiresAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleLicense(license.id)}
                                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title={license.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {license.isActive ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteLicense(license.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollAnimateWrapper>
      </div>

      {/* Create License Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New License</h3>
            <form onSubmit={handleCreateLicense} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Application
                </label>
                <select
                  required
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Expiry (days)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                  placeholder="30"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Max Devices
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={maxDevices}
                  onChange={(e) => setMaxDevices(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                  placeholder="1"
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg hover:shadow-lg font-semibold disabled:opacity-50 transition-all"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
