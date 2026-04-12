'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';

interface Application {
  id: string;
  name: string;
  apiKey: string;
  description?: string;
  createdAt: string;
  isActive: boolean;
  currentVersion?: string;
  minimumVersion?: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [currentVersion, setCurrentVersion] = useState('');
  const [minimumVersion, setMinimumVersion] = useState('');

  useEffect(() => {
    fetchApplications();
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
    } catch {
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/application/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Application created successfully!');
        setShowCreateModal(false);
        setName('');
        setDescription('');
        fetchApplications();
      } else {
        toast.error(data.error || 'Failed to create application');
      }
    } catch {
      toast.error('Failed to create application');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const toggleApiKeyVisibility = (appId: string) => {
    setShowApiKey(prev => ({ ...prev, [appId]: !prev[appId] }));
  };

  const handleEditVersion = (app: Application) => {
    setEditingApp(app);
    setCurrentVersion(app.currentVersion || '1.0.0');
    setMinimumVersion(app.minimumVersion || '1.0.0');
    setShowVersionModal(true);
  };

  const handleUpdateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) {
      return;
    }

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/application/update-version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: editingApp.id,
          currentVersion,
          minimumVersion,
        }),
      });

      if (response.ok) {
        toast.success('Version updated successfully!');
        setShowVersionModal(false);
        setEditingApp(null);
        fetchApplications();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update version');
      }
    } catch {
      toast.error('Failed to update version');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Applications 🚀
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Manage your applications and API keys for license validation
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Application
            </button>
          </div>
        </ScrollAnimateWrapper>

        {/* Applications Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading applications...</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <ScrollAnimateWrapper animation="scale">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No applications yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first application to start managing licenses!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Application
              </button>
            </div>
          </ScrollAnimateWrapper>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {applications.map((app, index) => (
              <ScrollAnimateWrapper key={app.id} animation="scale" delay={index * 100}>
                <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-all hover-lift group">
                  {/* Gradient overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity -mr-16 -mt-16"></div>
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{app.name}</h3>
                        {app.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">{app.description}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        app.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                      }`}>
                        {app.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* API Key */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        API Key
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-2.5 rounded-lg font-mono truncate">
                          {showApiKey[app.id] ? app.apiKey : '••••••••••••••••••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleApiKeyVisibility(app.id)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                          title={showApiKey[app.id] ? 'Hide' : 'Show'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showApiKey[app.id] ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => copyToClipboard(app.apiKey)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                          title="Copy"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Version Control */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Version Control
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-900 px-3 py-2.5 rounded-lg">
                          <div className="text-xs">
                            <span className="text-slate-500 dark:text-slate-400">Current:</span>{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">{app.currentVersion || '1.0.0'}</span>
                            <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                            <span className="text-slate-500 dark:text-slate-400">Min:</span>{' '}
                            <span className="font-semibold text-slate-900 dark:text-white">{app.minimumVersion || '1.0.0'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditVersion(app)}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                          title="Edit Version"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="mb-4">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Created
                      </label>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(app.createdAt)}</p>
                    </div>

                    {/* Action Link */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Link
                        href={`/dashboard/applications/${app.id}`}
                        className="inline-flex items-center gap-2 text-sm text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 font-semibold group/link transition-colors"
                      >
                        View Licenses & Integration
                        <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollAnimateWrapper>
            ))}
          </div>
        )}
      </div>

      {/* Create Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Application</h3>
            <form onSubmit={handleCreateApplication} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Application Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                  placeholder="My Awesome Application"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all resize-none"
                  placeholder="What is this application for?"
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

      {/* Version Edit Modal */}
      {showVersionModal && editingApp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 animate-scaleIn">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Version</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{editingApp.name}</p>
            <form onSubmit={handleUpdateVersion} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Current Version *
                </label>
                <input
                  type="text"
                  required
                  value={currentVersion}
                  onChange={(e) => setCurrentVersion(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                  placeholder="1.0.0"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  The latest version of your application
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Minimum Required Version *
                </label>
                <input
                  type="text"
                  required
                  value={minimumVersion}
                  onChange={(e) => setMinimumVersion(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 transition-all"
                  placeholder="1.0.0"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Users with versions below this will be blocked from logging in
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong className="font-semibold">Version Format:</strong> Use semantic versioning (e.g., 1.0.0, 2.1.3)<br/>
                  <strong className="font-semibold">Example:</strong> If minimum is 1.5.0, users with 1.4.9 will be blocked.
                </p>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowVersionModal(false);
                    setEditingApp(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg hover:shadow-lg font-semibold transition-all"
                >
                  Update Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
