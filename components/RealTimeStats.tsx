'use client';

import { useEffect, useState, useCallback } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Stats {
  totalApplications: number;
  totalUsers: number;
  activeUsers: number;
  totalLicenseKeys: number;
  validationCount: number;
  uptime: number;
  lastUpdated: string;
}

export default function RealTimeStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/public/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set fallback stats
      setStats({
        totalApplications: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalLicenseKeys: 0,
        validationCount: 0,
        uptime: 99.9,
        lastUpdated: new Date().toISOString()
      });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // IMPORTANT: All hooks must be called before any early returns
  // Animated counters - moved before the loading check
  const animatedUsers = useCountUp(stats?.totalUsers || 0, 2000, isVisible && !loading);
  const animatedActiveUsers = useCountUp(stats?.activeUsers || 0, 2000, isVisible && !loading);
  const animatedLicenses = useCountUp(stats?.totalLicenseKeys || 0, 2500, isVisible && !loading);
  const animatedValidations = useCountUp(stats?.validationCount || 0, 2500, isVisible && !loading);
  const animatedApps = useCountUp(stats?.totalApplications || 0, 1500, isVisible && !loading);
  const animatedUptime = useCountUp(
    stats?.uptime ? Math.floor(stats.uptime * 10) : 0,
    2000,
    isVisible && !loading
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return num.toLocaleString();
  };

  if (loading || !stats) {
    return (
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="text-center group cursor-default">
        <div className="text-5xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2 transition-transform group-hover:scale-110">
          {formatNumber(animatedUsers)}
          {stats && stats.totalUsers >= 1000 && '+'}
        </div>
        <div className="text-slate-600 dark:text-slate-300">Total Users</div>
        <div className="text-xs text-slate-400 mt-1">
          {formatNumber(animatedActiveUsers)} active
        </div>
      </div>
      
      <div className="text-center group cursor-default">
        <div className="text-5xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2 transition-transform group-hover:scale-110">
          {formatNumber(animatedLicenses)}
          {stats && stats.totalLicenseKeys >= 1000 && '+'}
        </div>
        <div className="text-slate-600 dark:text-slate-300">License Keys</div>
        <div className="text-xs text-slate-400 mt-1">
          {formatNumber(animatedValidations)} validations
        </div>
      </div>
      
      <div className="text-center group cursor-default">
        <div className="text-5xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2 transition-transform group-hover:scale-110">
          {formatNumber(animatedApps)}
          {stats && stats.totalApplications >= 1000 && '+'}
        </div>
        <div className="text-slate-600 dark:text-slate-300">Applications</div>
        <div className="text-xs text-slate-400 mt-1">protected</div>
      </div>
      
      <div className="text-center group cursor-default">
        <div className="text-5xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2 transition-transform group-hover:scale-110">
          {(animatedUptime / 10).toFixed(1)}%
        </div>
        <div className="text-slate-600 dark:text-slate-300">Uptime</div>
        <div className="text-xs text-slate-400 mt-1">last 30 days</div>
      </div>
    </div>
  );
}

