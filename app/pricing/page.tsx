'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';
import DashboardLayout from '@/components/DashboardLayout';
import { usePathname } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PricingPage() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const [annual, setAnnual] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only initialize dark mode if not in dashboard (dashboard has its own dark mode)
    if (!isDashboard) {
      const savedTheme = localStorage.getItem('darkMode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'true' || (savedTheme === null && prefersDark);
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDashboard]);

  if (!mounted && !isDashboard) {
    return null;
  }

  const pricingPlans = [
    {
      name: 'Free',
      price: 0,
      priceAnnual: 0,
      priceLabel: '',
      features: [
        { text: '2 Applications', icon: '📱' },
        { text: '25 Users per Application', icon: '👥' },
        { text: 'Licenses (per user)', icon: '🔑', note: 'Up to your user limit per app' },
        { text: 'Data Reset Every 6 Months', icon: '🔄', note: 'Users/clients data reset' },
        { text: '1 Reseller Manager', icon: '🤝' },
        { text: '10 Users under Reseller', icon: '📊' },
        { text: 'Basic Graphs', icon: '📈' },
        { text: 'Community Support', icon: '💬' },
      ],
      buttonText: user ? 'Current Plan' : 'Get Started',
      buttonLink: user ? '/dashboard/subscription' : '/register',
      buttonStyle: 'border-2 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:border-blue-600',
      popular: false,
    },
    {
      name: 'Pro',
      price: 1.8,
      priceAnnual: 11,
      priceLabel: annual ? 'per year' : 'per month',
      features: [
        { text: '25 Applications', icon: '📱' },
        { text: '500 Users per Application', icon: '👥' },
        { text: 'Licenses (per user)', icon: '🔑', note: 'Up to your user limit per app' },
        { text: 'No Data Reset', icon: '✅', highlight: true },
        { text: '10 Reseller Managers', icon: '🤝' },
        { text: '100 Users per Reseller', icon: '📊' },
        { text: '9-Box Matrix Data', icon: '📊', highlight: true },
        { text: 'Advanced Analytics', icon: '📈' },
        { text: 'Priority Support', icon: '⚡' },
        { text: 'Email Notifications', icon: '📧' },
      ],
      buttonText: user ? 'Upgrade to Pro' : 'Start Pro Trial',
      buttonLink: user ? '/dashboard/subscription' : '/register',
      buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
      popular: true,
    },
    {
      name: 'Advance',
      price: 2.9,
      priceAnnual: 16,
      priceLabel: annual ? 'per year' : 'per month',
      features: [
        { text: '70 Applications', icon: '📱' },
        { text: '850 Users per Application', icon: '👥' },
        { text: 'Licenses (per user)', icon: '🔑', note: 'Up to your user limit per app' },
        { text: 'No Data Reset', icon: '✅', highlight: true },
        { text: '45 Reseller Managers', icon: '🤝' },
        { text: '250 Users per Reseller', icon: '📊' },
        { text: '9-Box Matrix Data', icon: '📊', highlight: true },
        { text: 'Bell Curve & Advanced Graphs', icon: '📈', highlight: true },
        { text: 'Premium Analytics', icon: '📊' },
        { text: 'High Priority Support', icon: '⚡' },
        { text: 'Webhook Integration', icon: '🔗' },
        { text: 'API Rate Limits', icon: '🚀' },
      ],
      buttonText: user ? 'Upgrade to Advance' : 'Start Advance Trial',
      buttonLink: user ? '/dashboard/subscription' : '/register',
      buttonStyle: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-xl',
      popular: false,
    },
  ];

  const comparisonFeatures = [
    { feature: 'Applications', free: '2', pro: '25', advance: '70' },
    { feature: 'Users per App', free: '25', pro: '500', advance: '850' },
    { feature: 'Graphs & Analytics', free: 'Basic Graphs', pro: '9-Box Matrix', advance: '9-Box Matrix + Bell Curve + Advanced' },
    { feature: 'Data Reset', free: 'Every 6 months', pro: 'Never', advance: 'Never' },
    { feature: 'Reseller Managers', free: '1', pro: '10', advance: '45' },
    { feature: 'Users per Reseller', free: '10', pro: '100', advance: '250' },
    { feature: 'Price (Monthly)', free: '$0', pro: '$1.8', advance: '$2.9' },
    { feature: 'Price (Yearly)', free: '$0', pro: '$11', advance: '$16' },
    { feature: 'Support', free: 'Community', pro: 'Priority', advance: 'High Priority' },
  ];

  const whyDEEPAKX999AUTH = [
    {
      title: '🚀 Incredible Value',
      description: 'Get up to 70 applications and 850 users per app for just $2.9/month. Incredible value compared to competitors.',
      highlight: 'Save up to 93% compared to competitors',
    },
    {
      title: '🏆 Client Ranking System',
      description: 'Unique 6-tier ranking system (Bronze to Master) with 3 sub-tiers per rank. Visual themes, badges, and UI enhancements based on user rank. Unlock exclusive features as you progress.',
      highlight: 'Rank-based visual enhancements & badges',
    },
    {
      title: '🔒 Advanced Security',
      description: 'Enterprise-grade HWID binding, IP tracking, rate limiting, and comprehensive security logging. Industry-leading security features.',
      highlight: 'Bank-level encryption',
    },
    {
      title: '📊 Better Analytics',
      description: 'Real-time analytics, detailed graphs, activity tracking, and comprehensive insights. Advanced dashboard with powerful visualization tools.',
      highlight: 'Advanced dashboard included',
    },
    {
      title: '🤝 Reseller System',
      description: 'Built-in reseller management with granular permissions. Manage multiple resellers with ease and track their performance.',
      highlight: 'Included in all plans',
    },
    {
      title: '💻 Modern UI',
      description: 'Beautiful, responsive dashboard with dark mode. Professional design that enhances productivity and user experience.',
      highlight: 'Professional design',
    },
    {
      title: '⚡ Better Performance',
      description: 'Faster API responses, better scalability, and optimized database queries. Built on Firebase for reliability.',
      highlight: '99.9% uptime',
    },
    {
      title: '🔑 No Vendor Lock-in',
      description: 'You own your data and can export everything. Full control over your information with no vendor lock-in.',
      highlight: 'Full data ownership',
    },
    {
      title: '📈 Transparent Pricing',
      description: 'Simple, clear pricing with no hidden fees. Transparent costs that scale with your business needs.',
      highlight: 'No surprises',
    },
  ];

  const content = (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <ScrollAnimateWrapper animation="fade">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-300">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </ScrollAnimateWrapper>

      {/* Billing Toggle */}
      <ScrollAnimateWrapper animation="scale" delay={100}>
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-4 p-1.5 bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                !annual
                  ? 'bg-white shadow-md text-slate-900'
                  : 'text-slate-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                annual
                  ? 'bg-white shadow-md text-slate-900'
                  : 'text-slate-300'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Save 54%</span>
            </button>
          </div>
        </div>
      </ScrollAnimateWrapper>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-end">
        {pricingPlans.map((plan, index) => (
          <ScrollAnimateWrapper key={plan.name} animation="scale" delay={index * 100}>
            <div
              className={`relative rounded-2xl border-2 transition-all duration-300 flex flex-col h-full transform-gpu ${
                plan.popular
                  ? 'bg-slate-800/60 dark:bg-slate-900/60 backdrop-blur-sm border-blue-400 dark:border-blue-500 shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.02] px-8 pt-12 pb-8 -mt-16'
                  : 'bg-slate-700/40 dark:bg-slate-800/40 backdrop-blur-sm border-slate-600 dark:border-slate-700 hover:shadow-2xl hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-2 p-8'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className={`font-bold transition-all duration-300 ${
                    plan.popular 
                      ? 'text-5xl text-white hover:scale-110' 
                      : 'text-4xl text-white'
                  }`}
                  >
                    ${annual ? plan.priceAnnual : plan.price}
                  </span>
                  {plan.price > 0 && plan.priceLabel && (
                    <span className="text-sm text-slate-300">{plan.priceLabel}</span>
                  )}
                </div>
                {annual && plan.price > 0 && (
                  <p className="text-sm text-slate-400 mt-1">
                    ${((annual ? plan.priceAnnual : plan.price) / 12).toFixed(2)}/month billed annually
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-grow" style={{ minHeight: '520px' }}>
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 transition-transform duration-200 ${
                      plan.popular ? 'hover:scale-105 hover:translate-x-1' : 'hover:scale-[1.02]'
                    } ${
                      feature.highlight ? 'bg-green-900/30 rounded-lg p-2 -mx-2' : ''
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{feature.icon}</span>
                    <div className="flex-1">
                      <span className="text-white font-medium">{feature.text}</span>
                      {feature.note && (
                        <p className="text-xs text-slate-300 mt-0.5">{feature.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.buttonLink}
                className={`w-full block text-center px-6 py-3.5 rounded-lg font-bold text-lg transition-all duration-300 mt-auto ${plan.buttonStyle} ${
                  plan.popular 
                    ? 'hover:scale-110 hover:shadow-2xl hover:shadow-blue-600/40 hover-pulse-slow' 
                    : 'hover:scale-105 hover:shadow-xl'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          </ScrollAnimateWrapper>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <ScrollAnimateWrapper animation="fade" delay={400}>
        <div className="bg-slate-700/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-600 dark:border-slate-700 p-6 lg:p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-600">
                  <th className="text-left py-4 px-4 font-semibold text-white">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-300">Free</th>
                  <th className="text-center py-4 px-4 font-semibold text-purple-400">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-indigo-400">Advance</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-600 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-white">{item.feature}</td>
                    <td className="py-4 px-4 text-center text-slate-300">{item.free}</td>
                    <td className="py-4 px-4 text-center text-purple-400 font-semibold">
                      {item.pro}
                    </td>
                    <td className="py-4 px-4 text-center text-indigo-400 font-semibold">
                      {item.advance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollAnimateWrapper>

      {/* Why DEEPAKX999AUTH is Better */}
      <ScrollAnimateWrapper animation="fade" delay={500}>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Why DEEPAKX999AUTH is Better Than Other License Managers
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {whyDEEPAKX999AUTH.map((reason, idx) => (
              <div
                key={idx}
                className="bg-slate-700/40 backdrop-blur-sm rounded-xl p-6 border border-slate-600 hover:shadow-lg transition-all"
              >
                <h3 className="text-xl font-bold text-white mb-2">{reason.title}</h3>
                <p className="text-slate-300 mb-3">{reason.description}</p>
                <div className="inline-flex items-center gap-2 bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                  <span>✨</span>
                  <span>{reason.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollAnimateWrapper>

      {/* Cost Savings Calculator with Graph */}
      <ScrollAnimateWrapper animation="fade" delay={600}>
        <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-8 border-2 border-blue-600/50 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            💰 Cost Savings Comparison
          </h2>
          
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-700/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-slate-600">
              <div className="text-3xl font-bold text-blue-400 mb-2">93%</div>
              <div className="text-slate-300 font-medium">Monthly Savings</div>
              <div className="text-sm text-slate-400 mt-2">
                Advance: $2.9 vs Competitors: $40/month
              </div>
            </div>
            <div className="bg-slate-700/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-slate-600">
              <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-slate-300 font-medium">Yearly Savings</div>
              <div className="text-sm text-slate-400 mt-2">
                Advance: $16 vs Competitors: $480/year
              </div>
            </div>
            <div className="bg-slate-700/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg border border-slate-600">
              <div className="text-3xl font-bold text-indigo-400 mb-2">3x</div>
              <div className="text-slate-300 font-medium">More Features</div>
              <div className="text-sm text-slate-400 mt-2">
                Better analytics, resellers, security
              </div>
            </div>
          </div>

          {/* Cost Comparison Graph - Line Chart */}
          <div className="bg-slate-700/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Cost Savings Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[
                  { month: 'Month 1', DEEPAKX999AUTH: 0, Competitors: 0, Savings: 0 },
                  { month: 'Month 6', DEEPAKX999AUTH: 10.8, Competitors: 120, Savings: 109.2 },
                  { month: 'Month 12', DEEPAKX999AUTH: 21.6, Competitors: 240, Savings: 218.4 },
                  { month: 'Year 2', DEEPAKX999AUTH: 43.2, Competitors: 480, Savings: 436.8 },
                  { month: 'Year 3', DEEPAKX999AUTH: 64.8, Competitors: 720, Savings: 655.2 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorDEEPAKX999AUTH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorCompetitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="month" 
                  stroke="#cbd5e1" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#cbd5e1' }}
                />
                <YAxis 
                  stroke="#cbd5e1" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#cbd5e1' }}
                  label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#cbd5e1' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(51, 65, 85, 0.98)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: '#f1f5f9',
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'Savings') {
                      return [`$${value.toFixed(2)} Saved`, 'Savings'];
                    }
                    return [`$${value.toFixed(2)}`, name || 'Value'];
                  }}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Area type="monotone" dataKey="Competitors" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCompetitors)" />
                <Area type="monotone" dataKey="DEEPAKX999AUTH" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorDEEPAKX999AUTH)" />
                <Area type="monotone" dataKey="Savings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-slate-400">
              <p>Blue dashed area shows your savings • Purple line: DEEPAKX999AUTH Pro • Red line: Competitors</p>
            </div>
          </div>
        </div>
      </ScrollAnimateWrapper>

      {/* Custom Pricing Section */}
      <ScrollAnimateWrapper animation="fade" delay={800}>
        <div className="bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 rounded-2xl p-8 lg:p-12 border-2 border-indigo-500/50 backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Need Custom Pricing?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Have a large user base or specific requirements? We offer custom pricing plans tailored to your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-700/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Scale Your Business</h3>
              <p className="text-slate-300">
                Custom plans for businesses with 1000+ applications or 100,000+ users.
              </p>
            </div>
            <div className="bg-slate-700/60 backdrop-blur-sm rounded-xl p-6 border border-slate-600">
              <div className="text-3xl mb-3">🏢</div>
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Solutions</h3>
              <p className="text-slate-300">
                Dedicated support, SLA guarantees, and custom integrations for enterprise clients.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="mailto:sales@DEEPAKX999AUTH.space"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Sales for Custom Pricing
            </Link>
            <p className="text-sm text-slate-400 mt-4">
              We'll respond within 24 hours with a custom quote
            </p>
          </div>
        </div>
      </ScrollAnimateWrapper>

      {/* CTA Section */}
      <ScrollAnimateWrapper animation="fade" delay={700}>
        <div className="text-center bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-slate-200 mb-8">
            Join thousands of developers using DEEPAKX999AUTH. Start free, upgrade anytime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={user ? '/dashboard/subscription' : '/register'}
              className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all shadow-lg hover:scale-105"
            >
              {user ? 'View Plans' : 'Start Free Trial'}
            </Link>
            <Link
              href={user ? "/dashboard/docs" : "/docs"}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </ScrollAnimateWrapper>
    </div>
  );

  if (isDashboard) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
                DEEPAKX999AUTH
              </span>
            </Link>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex items-center gap-6">
                <Link href="/features" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
                <Link href="/use-cases" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Use Cases</Link>
                <Link href="/case-studies" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Case Studies</Link>
                <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                <Link href="/docs" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Docs</Link>
                <Link href="/faq" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</Link>
              </div>

              <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">{content}</div>
    </div>
  );
}

