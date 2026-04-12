'use client'

import DashboardLayout from '@/components/DashboardLayout';
import { RANK_CONFIG, ClientRank, RANK_PROGRESSION_CRITERIA } from '@/lib/types';

const ranks: ClientRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];

export default function RankCriteriaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Rank Progression Criteria</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Complete guide to all rank requirements and progression criteria
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
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
          {ranks.map((rank, index) => {
            const config = RANK_CONFIG[rank];
            const criteria = RANK_PROGRESSION_CRITERIA[rank];
            const nextRank = index < ranks.length - 1 ? ranks[index + 1] : null;
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
                        <h2 className={`text-2xl font-bold ${textColorClass}`}>
                          {config.displayName}
                        </h2>
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
                    {index === ranks.length - 1 && (
                      <div className={`px-4 py-2 rounded-lg bg-white/20 ${textColorClass} text-sm font-semibold`}>
                        Maximum Rank
                      </div>
                    )}
                  </div>
                </div>

                {/* Criteria to Reach This Rank */}
                {criteria && (
                  <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Requirements to Reach {config.displayName}:
                    </h3>
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
                {!nextCriteria && index === ranks.length - 1 && (
                  <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                      🏆 Congratulations! You've reached the maximum rank. This is the highest achievement level.
                    </p>
                  </div>
                )}

                {/* Next Rank Preview */}
                {nextRank && nextRankConfig && nextCriteria && (
                  <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                      Next Rank: {nextRankConfig.displayName} {nextRankConfig.icon}
                    </h3>
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
    </DashboardLayout>
  );
}

