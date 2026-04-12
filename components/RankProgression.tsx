'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RANK_CONFIG, ClientRank } from '@/lib/types';

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
  canProgress: boolean;
  progress: {
    invites: { current: number; required: number; percentage: number };
    clients: { current: number; required: number; percentage: number };
    subscriptions: { current: number; required: number; percentage: number };
  };
  reason?: string;
}

export default function RankProgression() {
  const { user } = useAuth();
  const [status, setStatus] = useState<RankProgressionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRankStatus();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRankStatus = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      
      const token = await user.getIdToken();
      const response = await fetch('/api/user/check-rank-progression', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success !== false) {
          setStatus(data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching rank status:', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching rank status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckProgression = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/user/check-rank-progression', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.promoted) {
          await fetchRankStatus(); // Refresh status
          alert(`🎉 Rank Promoted! ${data.message}`);
        } else {
          alert('Not yet eligible for rank progression. Keep working!');
        }
      }
    } catch (error) {
      console.error('Error checking progression:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">Unable to load rank progression data.</p>
        </div>
      </div>
    );
  }

  // Validate current rank exists
  if (!status.currentRank || !RANK_CONFIG[status.currentRank]) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="text-center py-8">
          <p className="text-slate-600 dark:text-slate-400">Invalid rank data. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const currentRankConfig = RANK_CONFIG[status.currentRank];
  const nextRankConfig = status.nextRank ? RANK_CONFIG[status.nextRank] : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rank Progression</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your progress toward the next rank
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${currentRankConfig.gradient} flex items-center justify-center text-white text-2xl shadow-lg`}>
            {currentRankConfig.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {currentRankConfig.displayName}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Level {currentRankConfig.level}</p>
          </div>
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📨</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Invites</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.invites}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👥</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Clients</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.clients}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subscriptions</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{status.stats.subscriptions}</p>
        </div>
      </div>

      {/* Next Rank Requirements */}
      {status.nextRank && status.criteria && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Progress to {nextRankConfig?.displayName} {nextRankConfig?.icon}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Meet <strong>ANY ONE</strong> of these criteria to progress:
          </p>

          <div className="space-y-4">
            {/* Invites Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📨</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {status.progress.invites.current} / {status.progress.invites.required} Invites
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {status.progress.invites.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${status.progress.invites.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Clients Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {status.progress.clients.current} / {status.progress.clients.required} Clients
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {status.progress.clients.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${status.progress.clients.percentage}%` }}
                ></div>
              </div>
            </div>

            {/* Subscriptions Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {status.progress.subscriptions.current} / {status.progress.subscriptions.required} Subscriptions
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {status.progress.subscriptions.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${status.progress.subscriptions.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Criteria Summary */}
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              <strong>Requirements for {nextRankConfig?.displayName}:</strong>
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <li>• {status.criteria.invites} Invites created, OR</li>
              <li>• {status.criteria.clients} Clients/Licenses created, OR</li>
              <li>• {status.criteria.subscriptions} Pro/Advance Subscriptions</li>
            </ul>
          </div>
        </div>
      )}

      {/* Check Progression Button */}
      <button
        onClick={handleCheckProgression}
        disabled={!status.canProgress}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          status.canProgress
            ? `bg-gradient-to-r ${nextRankConfig?.gradient || currentRankConfig.gradient} text-white hover:opacity-90`
            : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
        }`}
      >
        {status.canProgress ? 'Check for Rank Promotion' : 'Not Yet Eligible'}
      </button>

      {status.reason && !status.canProgress && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          {status.reason}
        </p>
      )}
    </div>
  );
}

