'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const features = [
    {
      title: "Hardware ID Binding",
      description: "Lock licenses to specific devices with automatic HWID generation",
      icon: "🔒",
      details: [
        "Automatic device fingerprinting (Windows, Linux, macOS)",
        "SHA-256 hashed hardware identifiers for security",
        "Admin-controlled HWID reset for legitimate hardware changes",
        "Multi-device licenses with configurable limits",
        "Real-time device tracking and analytics"
      ],
      implementation: "Auto-locks on first login. No manual configuration needed."
    },
    {
      title: "Enterprise Security",
      description: "Bank-grade encryption and security protocols",
      icon: "🛡️",
      details: [
        "AES-256 encryption for data at rest",
        "TLS 1.3 for all data in transit",
        "Bcrypt password hashing with salt",
        "Rate limiting (5 attempts per 15 min for API users)",
        "IP reputation tracking and automatic blocking",
        "Suspicious activity detection",
        "CSRF protection and secure session management",
        "DDoS protection with circuit breakers"
      ],
      implementation: "All security features enabled by default. Zero configuration required."
    },
    {
      title: "License Management",
      description: "Complete control over your software licenses",
      icon: "🎫",
      details: [
        "Bulk license generation (up to 10,000 at once)",
        "Expiration dates with automatic enforcement",
        "License key revocation and blacklisting",
        "Usage limits and concurrent user tracking",
        "Device binding per license",
        "License transfer and migration tools",
        "Export licenses to CSV for offline distribution"
      ],
      implementation: "Manage from dashboard or via REST API. Automated workflows supported."
    },
    {
      title: "Advanced Analytics",
      description: "Deep insights into license usage and user behavior",
      icon: "📊",
      details: [
        "Real-time license validation metrics",
        "Geographic distribution maps",
        "Device and browser analytics",
        "Login history with timestamps",
        "Failed validation attempt tracking",
        "Custom date range reporting",
        "Export data to CSV/JSON",
        "Webhook notifications for key events"
      ],
      implementation: "Built-in dashboards with drill-down capabilities. API access to raw data."
    },
    {
      title: "Multi-Platform SDKs",
      description: "Native SDKs for all major platforms",
      icon: "💻",
      details: [
        "C# SDK for .NET/Windows apps (WPF, WinForms, UWP)",
        "Python SDK for cross-platform desktop apps",
        "Java SDK with OSHI for enterprise software",
        "JavaScript/TypeScript for web and Electron apps",
        "REST API for any language",
        "Complete documentation with examples",
        "Auto-generated API clients"
      ],
      implementation: "Download SDK → Add API key → Integrate in 5 minutes"
    },
    {
      title: "User Management",
      description: "Comprehensive user account control",
      icon: "👥",
      details: [
        "Create users from dashboard or API",
        "Bulk user import from CSV",
        "User roles and permissions",
        "Account suspension and banning",
        "Password reset workflows",
        "Email verification",
        "Last login tracking",
        "Session management"
      ],
      implementation: "Full CRUD operations via UI or API. Automated onboarding supported."
    },
    {
      title: "Version Control",
      description: "Enforce minimum app versions",
      icon: "🔄",
      details: [
        "Set current and minimum supported versions",
        "Block outdated client logins automatically",
        "Version-specific license keys",
        "Update notifications via API",
        "Gradual rollout support",
        "Version analytics"
      ],
      implementation: "Set versions in dashboard. SDK checks automatically on login."
    },
    {
      title: "IP Tracking & Geolocation",
      description: "Monitor access from anywhere",
      icon: "🌍",
      details: [
        "Automatic IP capture on login",
        "Geolocation data (city, country)",
        "IP change detection and logging",
        "VPN/Proxy detection",
        "IP-based access restrictions (coming soon)",
        "Suspicious IP blocking"
      ],
      implementation: "Captured automatically. No additional code needed."
    },
    {
      title: "RESTful API",
      description: "Complete programmatic access",
      icon: "🔌",
      details: [
        "Full-featured REST API",
        "OpenAPI/Swagger documentation",
        "API key authentication",
        "Rate limiting per endpoint",
        "JSON responses",
        "Webhook support",
        "Batch operations",
        "Comprehensive error codes"
      ],
      implementation: "Use any HTTP client. Postman collection available."
    }
];

export default function FeaturesPage() {
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
              Everything You Need to
              <span className="block bg-gradient-to-r from-slate-600 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
                Protect Your Software
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Enterprise-grade features designed for developers, by developers
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all group hover-lift animate-scaleIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {feature.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {feature.details.map((detail, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Implementation</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{feature.implementation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Join 10,000+ developers protecting their software with DEEPAKX999AUTH
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                Start Free Trial
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg font-semibold text-lg border-2 border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-slate-400 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
    </div>
  );
}


