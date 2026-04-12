'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { RANK_CONFIG, ClientRank } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface UserRank {
  id: string;
  username?: string;
  email?: string; // Only available for admins
  clientRank?: ClientRank;
  rankSubTier?: string;
  createdAt: string;
  stats?: {
    invites: number;
    clients: number;
    subscriptions: number;
  };
}

export default function RankLeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [_isAdmin, setIsAdmin] = useState(false);
  const [sortBy, setSortBy] = useState<'rank' | 'invites' | 'clients' | 'subscriptions'>('rank');

  useEffect(() => {
    if (user) {
      checkAdminRole();
      fetchUsers();
    }
  }, [user]);

  const checkAdminRole = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.user && data.user.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
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

      if (response.ok) {
        const data = await response.json();
        // Sort users by rank level (highest first)
        const sortedUsers = (data.users || []).sort((a: UserRank, b: UserRank) => {
          const rankA = a.clientRank || 'bronze';
          const rankB = b.clientRank || 'bronze';
          const levelA = RANK_CONFIG[rankA].level;
          const levelB = RANK_CONFIG[rankB].level;
          return levelB - levelA;
        });
        setUsers(sortedUsers);
      } else {
        // If not admin, try to get public user list
        const publicResponse = await fetch('/api/public/users');
        if (publicResponse.ok) {
          const publicData = await publicResponse.json();
          const sortedUsers = (publicData.users || []).sort((a: UserRank, b: UserRank) => {
            const rankA = a.clientRank || 'bronze';
            const rankB = b.clientRank || 'bronze';
            const levelA = RANK_CONFIG[rankA].level;
            const levelB = RANK_CONFIG[rankB].level;
            return levelB - levelA;
          });
          setUsers(sortedUsers);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'rank') {
      const rankA = a.clientRank || 'bronze';
      const rankB = b.clientRank || 'bronze';
      const levelA = RANK_CONFIG[rankA].level;
      const levelB = RANK_CONFIG[rankB].level;
      if (levelA !== levelB) {
        return levelB - levelA;
      }
      // If same rank, sort by sub-tier
      const subTierOrder = { invite: 3, subscription: 2, client: 1 };
      const subTierA = subTierOrder[a.rankSubTier as keyof typeof subTierOrder] || 0;
      const subTierB = subTierOrder[b.rankSubTier as keyof typeof subTierOrder] || 0;
      return subTierB - subTierA;
    } else if (sortBy === 'invites') {
      return (b.stats?.invites || 0) - (a.stats?.invites || 0);
    } else if (sortBy === 'clients') {
      return (b.stats?.clients || 0) - (a.stats?.clients || 0);
    } else if (sortBy === 'subscriptions') {
      return (b.stats?.subscriptions || 0) - (a.stats?.subscriptions || 0);
    }
    return 0;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading leaderboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Rank Leaderboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            See all users and their ranks
          </p>
        </div>

        {/* Sort Options */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sort by:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('rank')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === 'rank'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Rank
              </button>
              <button
                onClick={() => setSortBy('invites')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === 'invites'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Invites
              </button>
              <button
                onClick={() => setSortBy('clients')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === 'clients'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Clients
              </button>
              <button
                onClick={() => setSortBy('subscriptions')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  sortBy === 'subscriptions'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Subscriptions
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Client Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedUsers.map((userRank, index) => {
                  const rankConfig = RANK_CONFIG[userRank.clientRank || 'bronze'];
                  return (
                    <tr key={userRank.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-600 dark:text-slate-400">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankConfig.gradient} flex items-center justify-center text-white font-semibold`}>
                            {(userRank.username || 'U')?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {userRank.username || 'User'}
                            </span>
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
                            {userRank.rankSubTier && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                {RANK_CONFIG[userRank.clientRank || 'bronze'].subTiers[userRank.rankSubTier as keyof typeof rankConfig.subTiers]?.icon} {userRank.rankSubTier}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Level {rankConfig.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {userRank.createdAt ? formatDate(userRank.createdAt) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

