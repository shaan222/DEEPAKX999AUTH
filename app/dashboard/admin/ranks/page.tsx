'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { RANK_CONFIG, ClientRank, RankSubTier } from '@/lib/types';

interface User {
  id: string;
  email: string;
  username?: string;  // Permanent username
  displayName?: string;
  role: string;
  clientRank?: ClientRank;
  rankSubTier?: RankSubTier;
  createdAt: string;
  lastLoginAt?: string;
  subscription?: any;
  provider?: string;
}

export default function AdminRankManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRankModal, setShowRankModal] = useState(false);
  const [updatingRank, setUpdatingRank] = useState(false);
  const [selectedRank, setSelectedRank] = useState<ClientRank>('bronze');
  const [selectedSubTier, setSelectedSubTier] = useState<RankSubTier>('client');

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
        fetchUsers();
      } else {
        setAccessDenied(true);
        setLoading(false);
      }
    } catch {
      setAccessDenied(true);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        toast.error(data.error || 'Failed to load users');
      }
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRank = async (userId: string, newRank: ClientRank, subTier: RankSubTier) => {
    setUpdatingRank(true);
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/admin/users/update-rank', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, clientRank: newRank, rankSubTier: subTier }),
      });

      const data = await response.json();

      if (response.ok) {
        const subTierInfo = RANK_CONFIG[newRank].subTiers[subTier];
        toast.success(`User rank updated to ${subTierInfo.displayName}`);
        setShowRankModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to update rank');
      }
    } catch {
      toast.error('Failed to update rank');
    } finally {
      setUpdatingRank(false);
    }
  };

  const openRankModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRank(user.clientRank || 'bronze');
    setSelectedSubTier(user.rankSubTier || 'client');
    setShowRankModal(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Group users by rank
  const usersByRank = filteredUsers.reduce((acc, user) => {
    const rank = user.clientRank || 'bronze';
    if (!acc[rank]) {
      acc[rank] = [];
    }
    acc[rank].push(user);
    return acc;
  }, {} as Record<ClientRank, User[]>);

  // Group users by rank and sub-tier
  const usersByRankAndSubTier = filteredUsers.reduce((acc, user) => {
    const rank = user.clientRank || 'bronze';
    const subTier = user.rankSubTier || 'client';
    if (!acc[rank]) {
      acc[rank] = { invite: [], client: [], subscription: [] };
    }
    // Push user to the appropriate sub-tier array
    acc[rank][subTier].push(user);
    return acc;
  }, {} as Record<ClientRank, Record<RankSubTier, User[]>>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">You need admin access to view this page.</p>
          <Link
            href="/dashboard"
            className="inline-block px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ranks: ClientRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Rank Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage client ranks and visual enhancements</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Rank Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ranks.map((rank) => {
          const config = RANK_CONFIG[rank];
          const count = usersByRank[rank]?.length || 0;
          const subTierCounts = usersByRankAndSubTier[rank] || { invite: [], client: [], subscription: [] };
          const gradientStyle = config.gradientColors.via
            ? {
                background: `linear-gradient(to bottom right, ${config.gradientColors.from}, ${config.gradientColors.via}, ${config.gradientColors.to})`,
              }
            : {
                background: `linear-gradient(to bottom right, ${config.gradientColors.from}, ${config.gradientColors.to})`,
              };
          
          // Determine text color based on rank brightness
          const isLightBackground = rank === 'platinum';
          const textColorClass = isLightBackground ? 'text-slate-900 dark:text-white' : 'text-white';
          
          return (
            <div
              key={rank}
              className="rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg"
              style={gradientStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl ${rank === 'diamond' ? 'drop-shadow-lg' : ''}`} style={rank === 'diamond' ? { filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))', textShadow: '0 0 8px rgba(255,255,255,0.5)' } : {}}>
                  {config.icon}
                </span>
                <span className={`text-2xl font-bold ${textColorClass}`}>{count}</span>
              </div>
              <p className={`text-sm font-semibold ${textColorClass} mb-3`}>{config.displayName}</p>
              <p className={`text-xs ${isLightBackground ? 'text-slate-700 dark:text-slate-200' : 'text-white/80'} mb-3`}>Level {config.level}</p>
              
              {/* Sub-Tiers */}
              <div className={`space-y-2 pt-2 border-t ${isLightBackground ? 'border-slate-300 dark:border-slate-600' : 'border-white/20'}`}>
                {(['invite', 'client', 'subscription'] as RankSubTier[]).map((subTier) => {
                  const subTierInfo = config.subTiers[subTier];
                  const subTierCount = subTierCounts[subTier]?.length || 0;
                  return (
                    <div key={subTier} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{subTierInfo.icon}</span>
                        <span className={`text-xs capitalize ${isLightBackground ? 'text-slate-800 dark:text-slate-100' : 'text-white/90'}`}>{subTier}</span>
                      </div>
                      <span className={`text-xs font-semibold ${textColorClass}`}>{subTierCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Users ({filteredUsers.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.map((user) => {
                const rankConfig = RANK_CONFIG[user.clientRank || 'bronze'];
                return (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankConfig.gradient} flex items-center justify-center text-white font-semibold`}>
                          {(user.username || user.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {user.username || user.displayName || 'User'}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{rankConfig.icon}</span>
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rankConfig.badgeColor} text-white`}>
                            {rankConfig.displayName}
                          </span>
                          {user.rankSubTier && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                              {RANK_CONFIG[user.clientRank || 'bronze'].subTiers[user.rankSubTier].icon} {user.rankSubTier}
                            </span>
                          )}
                        </div>
                      </div>
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
                      <button
                        onClick={() => openRankModal(user)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Change Rank
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rank Update Modal */}
      {showRankModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Update Rank for {selectedUser.username || selectedUser.email}
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Select New Rank
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ranks.map((rank) => {
                  const config = RANK_CONFIG[rank];
                  const isSelected = selectedRank === rank;
                  return (
                    <button
                      key={rank}
                      onClick={() => setSelectedRank(rank)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? `border-${rank}-500 bg-gradient-to-br ${config.gradient} text-white`
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{config.icon}</span>
                        <span className="font-semibold">{config.displayName}</span>
                        <span className="text-xs opacity-75">Level {config.level}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Select Sub-Tier
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['invite', 'client', 'subscription'] as RankSubTier[]).map((subTier) => {
                  const subTierInfo = RANK_CONFIG[selectedRank].subTiers[subTier];
                  const isSelected = selectedSubTier === subTier;
                  return (
                    <button
                      key={subTier}
                      onClick={() => setSelectedSubTier(subTier)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-slate-900 dark:border-slate-100 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl">{subTierInfo.icon}</span>
                        <span className="text-xs font-semibold capitalize">{subTier}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                Selected: {RANK_CONFIG[selectedRank].subTiers[selectedSubTier].displayName}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRankModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                disabled={updatingRank}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateRank(selectedUser.id, selectedRank, selectedSubTier)}
                disabled={updatingRank}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-all ${
                  updatingRank
                    ? 'bg-slate-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${RANK_CONFIG[selectedRank].gradient} hover:opacity-90`
                }`}
              >
                {updatingRank ? 'Updating...' : 'Update Rank'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
