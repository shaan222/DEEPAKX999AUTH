'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface SubscriptionStatus {
  tier: 'free' | 'pro';
  daysLeft?: number;
  limits: {
    applications: { current: number; limit: number };
    licenses: { current: number; limit: number };
    users: { current: number; limit: number };
  };
}

export default function SubscriptionBadge() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchSubscriptionStatus();
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    try {
      const token = await user?.getIdToken();
      const response = await fetch('/api/subscription/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) {
    return null;
  }

  const { tier, daysLeft, limits } = subscription;

  const getTierColor = () => {
    if (tier === 'pro') {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const getTierLabel = () => {
    if (tier === 'pro') {
      return daysLeft !== undefined ? `Pro (${daysLeft}d)` : 'Pro';
    }
    return 'Free';
  };

  return (
    <Link href="/dashboard/subscription">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getTierColor()} hover:opacity-90 transition-opacity cursor-pointer`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{getTierLabel()}</span>
          {tier !== 'pro' && (
            <span className="text-xs opacity-75">
              {limits.applications.current}/{limits.applications.limit === -1 ? '∞' : limits.applications.limit} apps
            </span>
          )}
        </div>
        {tier !== 'pro' && (
          <span className="text-xs font-medium">Upgrade →</span>
        )}
      </div>
    </Link>
  );
}

