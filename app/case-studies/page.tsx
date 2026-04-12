'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RealTimeStats from '@/components/RealTimeStats';

const caseStudies = [
    {
      company: "GameForge Studios",
      industry: "Indie Game Development",
      logo: "🎮",
      gradient: "from-slate-600 to-slate-900",
      challenge: "GameForge was losing $500K/year to piracy of their popular RPG title. Players were sharing license keys on forums, and the team had no way to track or prevent it.",
      solution: "Implemented DEEPAKX999AUTH with HWID binding. Each license key became locked to the player's hardware on first use, making key sharing impossible.",
      results: [
        { metric: "87%", label: "Reduction in piracy" },
        { metric: "$430K", label: "Annual revenue recovered" },
        { metric: "< 5 min", label: "Integration time" },
        { metric: "99.9%", label: "Validation success rate" }
      ],
      testimonial: "DEEPAKX999AUTH paid for itself in the first month. HWID binding stopped key sharing overnight, and the C# SDK integrated into Unity in literally 5 minutes.",
      author: "James Chen, Founder",
      implementation: "C# SDK with Unity integration, HWID binding enabled, 30-day licenses for seasonal passes",
      timeline: "Integrated in 1 day, deployed to 50K users over 2 weeks"
    },
    {
      company: "CloudTask SaaS",
      industry: "Project Management Software",
      logo: "☁️",
      gradient: "from-slate-500 to-slate-800",
      challenge: "CloudTask needed to enforce subscription tiers (Free, Pro, Enterprise) and prevent account sharing among team members. Their in-house auth system couldn't scale.",
      solution: "Migrated to DEEPAKX999AUTH's REST API for user authentication and license management. Used role-based licensing to differentiate tiers.",
      results: [
        { metric: "40%", label: "Reduction in dev costs" },
        { metric: "15K", label: "Users migrated seamlessly" },
        { metric: "3 days", label: "Full migration time" },
        { metric: "0", label: "Downtime during migration" }
      ],
      testimonial: "We were spending 30% of our engineering time maintaining our auth system. DEEPAKX999AUTH let us focus on our core product while providing better security than we could build ourselves.",
      author: "Sarah Martinez, CTO",
      implementation: "REST API integration with Next.js frontend, webhook notifications for subscription events, IP tracking for suspicious login detection",
      timeline: "Planning: 1 week, Migration: 3 days, Testing: 1 week"
    },
    {
      company: "DevTools Pro",
      industry: "Developer Tools & IDE Plugins",
      logo: "🛠️",
      gradient: "from-slate-600 to-slate-800",
      challenge: "DevTools Pro sells a premium VS Code extension. They needed time-limited trials (14 days) and seamless license validation that didn't interrupt developer workflow.",
      solution: "Integrated DEEPAKX999AUTH's JavaScript SDK with background validation. Licenses are checked on extension startup and refreshed silently every 24 hours.",
      results: [
        { metric: "65%", label: "Trial-to-paid conversion" },
        { metric: "12K", label: "Paid licenses sold" },
        { metric: "4.9/5", label: "User satisfaction score" },
        { metric: "0.1%", label: "License validation failures" }
      ],
      testimonial: "The async validation is brilliant. Users never see loading spinners or auth popups unless there's actually a problem. Trial expiration is enforced automatically.",
      author: "Alex Kumar, Lead Developer",
      implementation: "TypeScript SDK in VS Code extension, 14-day trial licenses with automatic expiration, machine hostname as HWID",
      timeline: "Integrated in 2 days, refined UX over 1 week"
    },
    {
      company: "SecureCAD Enterprise",
      industry: "Enterprise CAD Software",
      logo: "🏢",
      gradient: "from-slate-700 to-slate-900",
      challenge: "SecureCAD sells seat-based licenses to Fortune 500 companies (e.g., 500 seats for $250K). They needed concurrent user tracking, detailed audit logs for compliance, and on-premise deployment.",
      solution: "Deployed DEEPAKX999AUTH Enterprise with on-premise hosting behind client firewalls. Multi-device licenses track concurrent sessions and enforce seat limits.",
      results: [
        { metric: "100%", label: "License compliance" },
        { metric: "$2.3M", label: "Contract value secured" },
        { metric: "SOC2", label: "Compliance achieved" },
        { metric: "99.99%", label: "Uptime SLA met" }
      ],
      testimonial: "On-premise deployment was critical for our enterprise clients. DEEPAKX999AUTH handled our complex requirements while maintaining the simplicity of their API.",
      author: "Robert Williams, VP of Engineering",
      implementation: "Java SDK integration, on-premise Firebase deployment, concurrent session management, detailed audit logging, SAML SSO (custom integration)",
      timeline: "Requirements: 2 weeks, Implementation: 4 weeks, Enterprise deployment: 2 weeks"
    },
    {
      company: "FitnessPro App",
      industry: "Mobile Health & Fitness",
      logo: "📱",
      gradient: "from-slate-500 to-slate-700",
      challenge: "FitnessPro's iOS/Android app offered monthly subscriptions ($9.99/month). They needed to prevent users from sharing accounts and validate subscriptions across devices.",
      solution: "Used device IDs (UDID/Android ID) as HWID to lock subscriptions to specific phones. Integrated with Apple/Google billing via webhooks.",
      results: [
        { metric: "95%", label: "Subscription retention" },
        { metric: "50K", label: "Active subscribers" },
        { metric: "$6M", label: "Annual recurring revenue" },
        { metric: "4.8★", label: "App Store rating" }
      ],
      testimonial: "DEEPAKX999AUTH's REST API worked perfectly with React Native. The device binding stopped account sharing without hurting legitimate users who upgrade their phones.",
      author: "Emily Thompson, Product Manager",
      implementation: "REST API with React Native, device ID as HWID, 1-month licenses synced with app store subscriptions, webhook automation for renewals",
      timeline: "MVP in 1 week, production rollout over 3 months"
    },
    {
      company: "DataViz Analytics",
      industry: "Data Analysis & Visualization",
      logo: "📊",
      gradient: "from-slate-600 to-slate-900",
      challenge: "DataViz offers Python libraries for data scientists. They wanted to monetize their advanced features but struggled with piracy of their pip packages.",
      solution: "Added license validation to their Python package using DEEPAKX999AUTH's Python SDK. Advanced features only unlock with valid licenses.",
      results: [
        { metric: "2,500", label: "Paid licenses sold" },
        { metric: "$375K", label: "New revenue stream" },
        { metric: "92%", label: "License activation rate" },
        { metric: "< 1s", label: "Validation latency" }
      ],
      testimonial: "We were hesitant to add DRM to our Python package, but DEEPAKX999AUTH's implementation is so lightweight that users don't even notice it. And piracy dropped to nearly zero.",
      author: "Dr. Priya Patel, Creator",
      implementation: "Python SDK embedded in pip package, license validation on import, cached validation (24h) for offline work, machine-id as HWID",
      timeline: "Development: 3 days, beta testing: 2 weeks, full release: 1 week"
    }
];

export default function CaseStudiesPage() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'true' || (savedTheme === null && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDark = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
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
                
                <button
                  onClick={toggleDark}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? (
                    <svg className="w-5 h-5 text-slate-900 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-900 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                <Link
                  href="/login"
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4 animate-fadeIn">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Real Results from
              <span className="block bg-gradient-to-r from-slate-600 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
                Real Businesses
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              See how companies are using DEEPAKX999AUTH to protect their software and grow revenue
            </p>
          </div>
        </section>

        {/* Case Studies */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-slate-700 shadow-xl hover-lift animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${study.gradient} rounded-2xl flex items-center justify-center text-3xl`}>
                      {study.logo}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {study.company}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">{study.industry}</p>
                    </div>
                  </div>
                  <div className="inline-flex px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Case Study
                  </div>
                </div>

                {/* Challenge */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    Challenge
                  </h3>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    {study.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-blue-500">💡</span>
                    Solution
                  </h3>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                    {study.solution}
                  </p>
                </div>

                {/* Results */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-green-500">📈</span>
                    Results
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {study.results.map((result, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 text-center border border-slate-200 dark:border-slate-600"
                      >
                        <div className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-1">
                          {result.metric}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">{result.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Testimonial */}
                <div className="mb-8 p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl border-l-4 border-slate-700 dark:border-slate-400">
                  <p className="text-lg text-slate-800 dark:text-slate-100 italic mb-3">
                    "{study.testimonial}"
                  </p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    — {study.author}
                  </p>
                </div>

                {/* Implementation Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-wide">
                      Implementation
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {study.implementation}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-wide">
                      Timeline
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {study.timeline}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Summary */}
        <section className="py-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-12 animate-fadeIn">
              Trusted by Developers Worldwide
            </h2>
            <div className="animate-scaleIn">
              <RealTimeStats />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Join thousands of developers protecting their software with DEEPAKX999AUTH
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all"
            >
              Start Free Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
    </div>
  );
}

