'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { RANK_CONFIG, ClientRank, RankSubTier, RANK_PROGRESSION_CRITERIA } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email?: string; // Only available for admins
  username?: string;
  clientRank?: ClientRank;
  rankSubTier?: RankSubTier;
  createdAt: string;
  stats?: {
    invites: number;
    clients: number;
    subscriptions: number;
  };
}

interface RankProgressionStatus {
  currentRank: ClientRank;
  currentSubTier: string;
  stats: {
    invites: number;
    clients: number;
    subscriptions: number;
  };
  nextRank?: ClientRank;
  criteria?: {
    invites: number;
    clients: number;
    subscriptions: number;
  };
  progress: {
    invites: { current: number; required: number; percentage: number };
    clients: { current: number; required: number; percentage: number };
    subscriptions: { current: number; required: number; percentage: number };
  };
  canProgress: boolean;
}

export default function UserRanksPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<User | null>(null);
  const [rankProgression, setRankProgression] = useState<RankProgressionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sortBy, setSortBy] = useState<'rank' | 'invites' | 'clients' | 'subscriptions'>('rank');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      checkAdminRole();
      fetchUsers();
      fetchRankProgression();
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
      if (!user) {
        setLoading(false);
        return;
      }
      
      const token = await user.getIdToken();
      
      // Try admin endpoint first, fallback to public
      let response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        response = await fetch('/api/public/users');
      }

      if (response.ok) {
        const data = await response.json();
        const allUsers = data.users || [];
        
        // Find current user
        const currentUser = allUsers.find((u: User) => u.id === user.uid);
        if (currentUser) {
          setCurrentUserRank(currentUser);
        }
        
        setUsers(allUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRankProgression = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/check-rank-progression', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success !== false) {
          setRankProgression(data);
        }
      }
    } catch (error) {
      console.error('Error fetching rank progression:', error);
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesUsername = (u.username || '').toLowerCase().includes(searchLower);
    // Only allow email search for admins
    const matchesEmail = isAdmin ? (u.email || '').toLowerCase().includes(searchLower) : false;
    return matchesUsername || matchesEmail;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
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

  // Get user's position in leaderboard
  const userPosition = currentUserRank
    ? sortedUsers.findIndex((u) => u.id === currentUserRank.id) + 1
    : null;

  // Get users above and below current user
  const usersAbove = userPosition ? sortedUsers.slice(0, userPosition - 1).slice(-3) : [];
  const usersBelow = userPosition
    ? sortedUsers.slice(userPosition, userPosition + 3)
    : sortedUsers.slice(0, 3);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading ranks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentRankConfig = currentUserRank
    ? RANK_CONFIG[currentUserRank.clientRank || 'bronze']
    : null;
  const nextRankConfig = rankProgression?.nextRank
    ? RANK_CONFIG[rankProgression.nextRank]
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Rank Leaderboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Compare your rank with other users and track your progression
          </p>
        </div>

        {/* Current User Rank Card */}
        {currentUserRank && currentRankConfig && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentRankConfig.gradient} flex items-center justify-center text-white text-4xl shadow-lg`}>
                  {currentRankConfig.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {currentUserRank.username || 'User'}
                  </h2>
                  {isAdmin && (
                    <p className="text-slate-300 text-sm">{currentUserRank.email}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${currentRankConfig.badgeColor} text-white`}>
                      {currentRankConfig.displayName}
                    </span>
                    {currentUserRank.rankSubTier && (
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-white/20 text-white">
                        {RANK_CONFIG[currentUserRank.clientRank || 'bronze'].subTiers[currentUserRank.rankSubTier].icon} {currentUserRank.rankSubTier}
                      </span>
                    )}
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-white/20 text-white">
                      Level {currentRankConfig.level}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-white">#{userPosition || '?'}</div>
                <div className="text-sm text-slate-300">Position</div>
              </div>
            </div>

            {/* Current Stats */}
            {rankProgression && (
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{rankProgression.stats.invites}</div>
                  <div className="text-xs text-slate-300">Invites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{rankProgression.stats.clients}</div>
                  <div className="text-xs text-slate-300">Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{rankProgression.stats.subscriptions}</div>
                  <div className="text-xs text-slate-300">Subscriptions</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Level Up Progress */}
        {rankProgression && rankProgression.nextRank && nextRankConfig && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Progress to {nextRankConfig.displayName} {nextRankConfig.icon}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Meet <strong>ANY ONE</strong> of these criteria to level up
                </p>
              </div>
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${nextRankConfig.gradient} flex items-center justify-center text-white text-2xl`}>
                {nextRankConfig.icon}
              </div>
            </div>

            <div className="space-y-4">
              {/* Invites Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📨</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {rankProgression.progress.invites.current} / {rankProgression.progress.invites.required} Invites
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {rankProgression.progress.invites.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, rankProgression.progress.invites.percentage)}%` }}
                  ></div>
                </div>
              </div>

              {/* Clients Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {rankProgression.progress.clients.current} / {rankProgression.progress.clients.required} Clients
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {rankProgression.progress.clients.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, rankProgression.progress.clients.percentage)}%` }}
                  ></div>
                </div>
              </div>

              {/* Subscriptions Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {rankProgression.progress.subscriptions.current} / {rankProgression.progress.subscriptions.required} Subscriptions
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {rankProgression.progress.subscriptions.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, rankProgression.progress.subscriptions.percentage)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {rankProgression.canProgress && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200 text-center">
                  🎉 You're eligible for rank progression! Your rank will be updated automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Comparison Section */}
        {currentUserRank && (usersAbove.length > 0 || usersBelow.length > 0) && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Your Position</h3>
            <div className="space-y-3">
              {/* Users Above */}
              {usersAbove.map((u, idx) => {
                const rankConfig = RANK_CONFIG[u.clientRank || 'bronze'];
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 w-8">
                        #{userPosition! - usersAbove.length + idx}
                      </span>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankConfig.gradient} flex items-center justify-center text-white font-semibold`}>
                        {(u.username || 'U')?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {u.username || 'User'}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rankConfig.displayName}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Current User */}
              {currentUserRank && currentRankConfig && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border-2 border-blue-300 dark:border-blue-600">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400 w-8">
                      #{userPosition}
                    </span>
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentRankConfig.gradient} flex items-center justify-center text-white font-semibold shadow-lg`}>
                      {(currentUserRank.username || 'U')?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {currentUserRank.username || 'You'}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{currentRankConfig.displayName} • Level {currentRankConfig.level}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                    YOU
                  </span>
                </div>
              )}

              {/* Users Below */}
              {usersBelow.map((u, idx) => {
                const rankConfig = RANK_CONFIG[u.clientRank || 'bronze'];
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 w-8">
                        #{userPosition ? userPosition + idx + 1 : idx + 1}
                      </span>
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankConfig.gradient} flex items-center justify-center text-white font-semibold`}>
                        {(u.username || 'U')?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {u.username || 'User'}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{rankConfig.displayName}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Sort */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={isAdmin ? "Search by username or email..." : "Search by username..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rank">Rank</option>
                <option value="invites">Invites</option>
                <option value="clients">Clients</option>
                <option value="subscriptions">Subscriptions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Full Leaderboard Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Full Leaderboard ({filteredUsers.length} users)</h2>
          </div>
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
                  const isCurrentUser = userRank.id === currentUserRank?.id;
                  return (
                    <tr
                      key={userRank.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                        isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            #{index + 1}
                          </span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankConfig.gradient} flex items-center justify-center text-white font-semibold`}>
                            {(userRank.username || 'U')?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${isCurrentUser ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
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

        {/* Rank Progression Criteria Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rank Progression Criteria</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Complete guide to all rank requirements and progression criteria
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How Rank Progression Works
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  To progress to the next rank, you need to meet <strong>ANY ONE</strong> of the three criteria (Invites, Clients, or Subscriptions). 
                  You don't need to meet all three - just one is enough!
                </p>
              </div>
            </div>
          </div>

          {/* All Ranks Criteria */}
          <div className="grid gap-6">
            {(['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'] as ClientRank[]).map((rank, index) => {
              const config = RANK_CONFIG[rank];
              const criteria = RANK_PROGRESSION_CRITERIA[rank];
              const nextRank = index < 5 ? (['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'] as ClientRank[])[index + 1] : null;
              const nextRankConfig = nextRank ? RANK_CONFIG[nextRank] : null;
              const nextCriteria = nextRank ? RANK_PROGRESSION_CRITERIA[nextRank] : null;

              const gradientStyle = config.gradientColors.via
                ? {
                    background: `linear-gradient(to bottom right, ${config.gradientColors.from}, ${config.gradientColors.via}, ${config.gradientColors.to})`,
                  }
                : {
                    background: `linear-gradient(to bottom right, ${config.gradientColors.from}, ${config.gradientColors.to})`,
                  };

              const isLightBackground = rank === 'platinum';
              const textColorClass = isLightBackground ? 'text-slate-900 dark:text-white' : 'text-white';

              return (
                <div
                  key={rank}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  {/* Rank Header */}
                  <div
                    className="p-6"
                    style={gradientStyle}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`text-4xl ${rank === 'diamond' ? 'drop-shadow-lg' : ''}`}>
                          {config.icon}
                        </span>
                        <div>
                          <h3 className={`text-2xl font-bold ${textColorClass}`}>
                            {config.displayName}
                          </h3>
                          <p className={`text-sm ${isLightBackground ? 'text-slate-700 dark:text-slate-200' : 'text-white/80'}`}>
                            Level {config.level}
                          </p>
                        </div>
                      </div>
                      {index === 0 && (
                        <div className={`px-4 py-2 rounded-lg bg-white/20 ${textColorClass} text-sm font-semibold`}>
                          Starting Rank
                        </div>
                      )}
                      {index === 5 && (
                        <div className={`px-4 py-2 rounded-lg bg-white/20 ${textColorClass} text-sm font-semibold`}>
                          Maximum Rank
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Criteria to Reach This Rank */}
                  {criteria && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Requirements to Reach {config.displayName}:
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">📨</span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invites</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{criteria.invites}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Invite codes created</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">👥</span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Clients</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{criteria.clients}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Licenses/clients created</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">⭐</span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subscriptions</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{criteria.subscriptions}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pro/Advance subscriptions</p>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>Note:</strong> You only need to meet <strong>ONE</strong> of these criteria to progress to {config.displayName}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Starting Rank Message */}
                  {!criteria && index === 0 && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                        This is the starting rank. All new users begin here.
                      </p>
                    </div>
                  )}

                  {/* Maximum Rank Message */}
                  {!nextCriteria && index === 5 && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                        🏆 Congratulations! You've reached the maximum rank. This is the highest achievement level.
                      </p>
                    </div>
                  )}

                  {/* Next Rank Preview */}
                  {nextRank && nextRankConfig && nextCriteria && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Next Rank: {nextRankConfig.displayName} {nextRankConfig.icon}
                      </h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">📨</span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Invites</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">{nextCriteria.invites}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">👥</span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Clients</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">{nextCriteria.clients}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">⭐</span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subscriptions</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">{nextCriteria.subscriptions}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

