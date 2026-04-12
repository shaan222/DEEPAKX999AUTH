'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';

interface SubscriptionStatus {
  tier: 'free' | 'pro' | 'advance';
  daysLeft?: number;
  limits: {
    applications: { current: number; limit: number };
    licenses: { current: number; limit: number };
    users: { current: number; limit: number };
  };
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
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
    } catch {
      toast.error('Failed to load subscription status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading subscription...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!subscription) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Failed to load subscription</h3>
          <p className="text-slate-600 dark:text-slate-400">Please try refreshing the page</p>
        </div>
      </DashboardLayout>
    );
  }

  const { tier, daysLeft, limits } = subscription;

  const formatLimit = (current: number, limit: number) => {
    if (limit === -1) {
      return { text: `${current} / Unlimited`, unlimited: true };
    }
    return { text: `${current} / ${limit}`, unlimited: false, percentage: (current / limit) * 100 };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) {
      return 'bg-green-500 dark:bg-green-600';
    }
    if (percentage < 80) {
      return 'bg-yellow-500 dark:bg-yellow-600';
    }
    return 'bg-red-500 dark:bg-red-600';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Subscription & Limits 💎
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage your plan and track your usage
            </p>
          </div>
        </ScrollAnimateWrapper>

        {/* Current Plan */}
        <ScrollAnimateWrapper animation="scale">
          <div className={`relative overflow-hidden rounded-2xl shadow-xl border p-8 ${
            tier === 'pro'
              ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            {/* Gradient overlay for Pro */}
            {tier === 'pro' && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300 to-pink-300 dark:from-purple-700 dark:to-pink-700 rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
            )}
            
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Current Plan</h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {tier === 'pro' && (
                      daysLeft !== undefined 
                        ? `Pro subscription active. Renews in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} 🎯`
                        : 'Pro plan active with 25 applications and 500 users per app ✨'
                    )}
                    {tier === 'advance' && (
                      daysLeft !== undefined 
                        ? `Advance subscription active. Renews in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} 🎯`
                        : 'Advance plan active with 70 applications and 850 users per app 🚀'
                    )}
                    {tier === 'free' && 'Limited access - Upgrade to Pro or Advance for more features'}
                  </p>
                </div>
                <div className={`px-6 py-3 rounded-lg font-bold text-lg ${
                  tier === 'pro' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : tier === 'advance'
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}>
                  {tier === 'pro' ? '✨ PRO' : tier === 'advance' ? '🚀 ADVANCE' : 'FREE'}
                </div>
              </div>

              {tier !== 'pro' && tier !== 'advance' && (
                <Link
                  href="/pricing"
                  className="w-full block text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  ✨ View Plans & Upgrade
                </Link>
              )}
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Usage Limits */}
        <ScrollAnimateWrapper animation="slide-left" delay={100}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Usage Limits</h2>
            
            <div className="space-y-6">
              {/* Applications */}
              {(() => {
                const limitInfo = formatLimit(limits.applications.current, limits.applications.limit);
                return (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Applications</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total applications created</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-slate-900 dark:text-white">{limitInfo.text}</p>
                        {!limitInfo.unlimited && limitInfo.percentage! >= 100 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">Limit reached</p>
                        )}
                      </div>
                    </div>
                    {!limitInfo.unlimited && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(limitInfo.percentage!)}`} 
                          style={{ width: `${Math.min(limitInfo.percentage!, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Licenses */}
              {(() => {
                const limitInfo = formatLimit(limits.licenses.current, limits.licenses.limit);
                return (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Licenses</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total license keys created</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-slate-900 dark:text-white">{limitInfo.text}</p>
                        {!limitInfo.unlimited && limitInfo.percentage! >= 100 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">Limit reached</p>
                        )}
                      </div>
                    </div>
                    {!limitInfo.unlimited && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(limitInfo.percentage!)}`} 
                          style={{ width: `${Math.min(limitInfo.percentage!, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Users */}
              {(() => {
                const limitInfo = formatLimit(limits.users.current, limits.users.limit);
                return (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">Users</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total end-users/clients across all apps</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-slate-900 dark:text-white">{limitInfo.text}</p>
                        {!limitInfo.unlimited && limitInfo.percentage! >= 100 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">Limit reached</p>
                        )}
                      </div>
                    </div>
                    {!limitInfo.unlimited && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getProgressColor(limitInfo.percentage!)}`} 
                          style={{ width: `${Math.min(limitInfo.percentage!, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Pricing Plans Section */}
        <ScrollAnimateWrapper animation="fade" delay={300}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Available Plans
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
              Choose the plan that best fits your needs. Upgrade or downgrade anytime.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className={`rounded-xl p-6 border-2 ${
                tier === 'free' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free</h3>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">$0</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Forever</div>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>2 Applications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>25 Users per App</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Basic Graphs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Community Support</span>
                  </li>
                </ul>
                {tier === 'free' ? (
                  <div className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-center">
                    Current Plan
                  </div>
                ) : (
                  <Link
                    href="/pricing"
                    className="w-full block text-center px-4 py-2 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-900 dark:text-white hover:border-blue-500 transition-all"
                  >
                    View Details
                  </Link>
                )}
              </div>

              {/* Pro Plan */}
              <div className={`rounded-xl p-6 border-2 ${
                tier === 'pro' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}>
                <div className="text-center mb-4">
                  <div className="inline-block bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                    POPULAR
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pro</h3>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">$1.8</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">per month</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">or $10/year</div>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>25 Applications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>500 Users per App</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>10 Reseller Managers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>No Data Reset</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="font-semibold">9-Box Matrix Data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Priority Support</span>
                  </li>
                </ul>
                {tier === 'pro' ? (
                  <div className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold text-center">
                    Current Plan
                  </div>
                ) : (
                  <Link
                    href="/pricing"
                    className="w-full block text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    Upgrade to Pro
                  </Link>
                )}
              </div>

              {/* Advance Plan */}
              <div className={`rounded-xl p-6 border-2 ${
                tier === 'advance' 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}>
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Advance</h3>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">$2.9</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">per month</div>
                  <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">or $16/year</div>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>70 Applications</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>850 Users per App</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>45 Reseller Managers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>No Data Reset</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="font-semibold">9-Box Matrix Data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="font-semibold">Bell Curve & Advanced Graphs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>High Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Webhook Integration</span>
                  </li>
                </ul>
                {tier === 'advance' ? (
                  <div className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold text-center">
                    Current Plan
                  </div>
                ) : (
                  <Link
                    href="/pricing"
                    className="w-full block text-center px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    Upgrade to Advance
                  </Link>
                )}
              </div>
            </div>

            {/* Link to full pricing page */}
            <div className="mt-8 text-center">
              <Link
                href="/pricing"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline"
              >
                View Full Pricing & Comparison →
              </Link>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Plan Comparison */}
        {tier !== 'pro' && (
          <ScrollAnimateWrapper animation="slide-right" delay={200}>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800 p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">🚀 Unlock Pro Features</h2>
              <ul className="space-y-4 mb-6">
                {[
                  { icon: '📱', text: 'Unlimited Applications' },
                  { icon: '🔑', text: 'Unlimited Licenses' },
                  { icon: '👥', text: 'Unlimited Users' },
                  { icon: '⚡', text: 'Priority Support' },
                  { icon: '📊', text: 'Advanced Analytics' },
                  { icon: '🔒', text: 'Enhanced Security Features' },
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="font-medium text-lg">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="w-full block text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                ✨ View Plans & Upgrade
              </Link>
            </div>
          </ScrollAnimateWrapper>
        )}
      </div>
    </DashboardLayout>
  );
}
