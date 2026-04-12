'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface InviteCode {
  id: string;
  code: string;
  isActive: boolean;
  maxUses: number;
  currentUses: number;
  expiresAt: string | null;
  description: string;
  createdAt: string;
  lastUsedAt: string | null;
  usedByCount: number;
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  totalUses: number;
}

export default function InviteCodesPage() {
  const { user } = useAuth();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Create form state
  const [maxUses, setMaxUses] = useState('-1');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [description, setDescription] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
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
        fetchInviteCodes();
      } else {
        setAccessDenied(true);
        setLoading(false);
      }
    } catch {
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const fetchInviteCodes = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/invite-code/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setInviteCodes(data.inviteCodes);
        setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to load invite codes');
      }
    } catch {
      toast.error('Failed to load invite codes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/invite-code/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxUses: parseInt(maxUses),
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null,
          description,
          customCode: customCode || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Invite code created: ${data.inviteCode.code}`);
        setShowCreateModal(false);
        setMaxUses('-1');
        setExpiresInDays('');
        setDescription('');
        setCustomCode('');
        fetchInviteCodes();
      } else {
        toast.error(data.error || 'Failed to create invite code');
      }
    } catch {
      toast.error('Failed to create invite code');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (inviteCodeId: string) => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/invite-code/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCodeId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchInviteCodes();
      } else {
        toast.error(data.error || 'Failed to toggle status');
      }
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Invite code copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-400"></div>
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
          <p className="text-slate-600 dark:text-slate-400">Only administrators can manage invite codes.</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Contact your administrator if you need access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Invite Codes</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">Manage registration invite codes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[40px] px-3 sm:px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap font-medium"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Create Code</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 dark:text-green-400">Active</p>
                <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">{stats.active}</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-700 dark:text-red-400">Expired</p>
                <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{stats.expired}</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-700 dark:text-purple-400">Uses</p>
                <p className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{stats.totalUses}</p>
              </div>
              <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Codes Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Code</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Usage</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Expires</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">Description</th>
                  <th className="px-2 sm:px-3 md:px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {inviteCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 sm:px-4 py-6 sm:py-8 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="text-xs sm:text-sm font-medium">No invite codes yet</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="text-xs text-slate-900 dark:text-white hover:underline font-medium px-2 py-1"
                        >
                          Create your first code
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  inviteCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-1 min-w-0">
                          <code className="text-xs font-mono font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded truncate max-w-[90px] sm:max-w-none">
                            {code.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 active:scale-95 transition-all p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            title="Copy"
                            aria-label="Copy"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap">
                        {code.isActive ? (
                          <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold text-green-800 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-1.5 py-0.5 text-xs font-semibold text-red-800 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs text-slate-900 dark:text-white font-medium hidden md:table-cell">
                        <span className="tabular-nums">{code.currentUses}/{code.maxUses === -1 ? '∞' : code.maxUses}</span>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap text-xs text-slate-900 dark:text-white hidden lg:table-cell">
                        {code.expiresAt ? formatDate(code.expiresAt) : 'Never'}
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-xs text-slate-600 dark:text-slate-300 hidden xl:table-cell">
                        <div className="max-w-xs truncate" title={code.description || '-'}>
                          {code.description || '-'}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(code.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all active:scale-95 ${
                            code.isActive
                              ? 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                              : 'text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                          }`}
                        >
                          <span className="hidden sm:inline">{code.isActive ? 'Deactivate' : 'Activate'}</span>
                          <span className="sm:hidden">{code.isActive ? 'Off' : 'On'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-5 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pr-2">Create Invite Code</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 active:scale-95 transition-all rounded-lg p-1.5 -mr-1.5 -mt-1.5"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateInviteCode} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Custom Code <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                  placeholder="Auto-generate"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-transparent transition-all text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave empty for random</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Max Uses
                </label>
                <select
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-transparent transition-all text-sm"
                >
                  <option value="-1">Unlimited</option>
                  <option value="1">1 use</option>
                  <option value="5">5 uses</option>
                  <option value="10">10 uses</option>
                  <option value="25">25 uses</option>
                  <option value="50">50 uses</option>
                  <option value="100">100 uses</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expires In <span className="text-slate-400 dark:text-slate-500 font-normal">(Days)</span>
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="Never"
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-transparent transition-all text-sm"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leave empty for never</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="For beta testers, VIP users, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-transparent resize-none transition-all text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-3 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-[0.98] transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {creating ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

