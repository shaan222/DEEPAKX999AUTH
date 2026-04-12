'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "Do I need a credit card to start the free trial?",
          a: "No! You can start using DEEPAKX999AUTH immediately with no credit card required. The free plan includes 1 application, 100 license keys, and 10,000 API calls per month - perfect for getting started."
        },
        {
          q: "How long does it take to integrate DEEPAKX999AUTH?",
          a: "Most developers integrate DEEPAKX999AUTH in under 30 minutes. We provide ready-to-use SDKs for C#, Python, Java, JavaScript, and more. Just download the SDK, add your API key, and you're ready to go. Check our Quick Start guide for a 5-minute setup tutorial."
        },
        {
          q: "What programming languages do you support?",
          a: "We provide official SDKs for C#, Python, Java, JavaScript/TypeScript, PHP, Go, and Rust. Additionally, our REST API can be used with any programming language that supports HTTP requests."
        }
      ]
    },
    {
      category: "Security & Compliance",
      questions: [
        {
          q: "How secure is my data?",
          a: "We use enterprise-grade security: AES-256 encryption for data at rest, TLS 1.3 for data in transit, SHA-256 for HWID hashing, and secure key storage. All passwords are hashed with bcrypt. We also implement rate limiting, IP reputation tracking, and suspicious activity detection."
        },
        {
          q: "Are you GDPR compliant?",
          a: "Yes. We are fully GDPR compliant. We provide data export, deletion capabilities, and only collect minimal necessary data. Your users' data is stored securely and you maintain full control. We have data processing agreements available for enterprise customers."
        },
        {
          q: "Where is my data stored?",
          a: "Data is stored on Google Cloud Platform (Firebase) with automatic backups and geo-redundancy. For enterprise customers, we offer region-specific data storage and on-premise deployment options."
        },
        {
          q: "Do you support on-premise deployment?",
          a: "Yes! On-premise deployment is available for Enterprise plan customers. This allows you to host DEEPAKX999AUTH on your own infrastructure for maximum control and compliance requirements."
        }
      ]
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          q: "How does Hardware ID (HWID) binding work?",
          a: "HWID binding locks a license to a specific device. When a user logs in for the first time, their device's unique hardware identifier is captured and saved. Subsequent logins must come from the same device. This prevents license sharing and piracy. Admins can reset HWIDs when users legitimately change hardware."
        },
        {
          q: "Can users login from multiple devices?",
          a: "By default, each user is locked to one device (HWID binding). However, you can disable HWID locking for specific users or configure multi-device licenses that allow a set number of concurrent devices."
        },
        {
          q: "What happens if a user changes their hardware?",
          a: "Admins can reset a user's HWID from the dashboard, allowing them to login from a new device. On their next login, the new device will be locked. This process prevents abuse while accommodating legitimate hardware changes."
        },
        {
          q: "Can I set license expiration dates?",
          a: "Yes! You can set expiration dates when creating licenses or users. The system supports date-only expiration (no time component) for simplicity. Expired licenses are automatically blocked from validation."
        },
        {
          q: "Do you support offline license validation?",
          a: "Currently, DEEPAKX999AUTH requires online validation. However, the SDKs include session caching that allows temporary offline usage (up to 24 hours) after a successful validation. Full offline activation is on our roadmap."
        }
      ]
    },
    {
      category: "Billing & Plans",
      questions: [
        {
          q: "Can I upgrade or downgrade my plan anytime?",
          a: "Yes! You can change your plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle. You'll never lose access to your data."
        },
        {
          q: "What happens if I exceed my plan limits?",
          a: "We'll send you email notifications when you approach your limits (80% and 95%). If you exceed API call limits, additional calls are charged at $0.10 per 1,000 calls. You can upgrade your plan anytime to increase limits."
        },
        {
          q: "Do you offer refunds?",
          a: "Yes. If you're not satisfied within the first 30 days, we offer a full refund, no questions asked. After 30 days, we prorate refunds based on unused time for annual plans."
        },
        {
          q: "Do you offer discounts for annual billing?",
          a: "Yes! Annual billing saves you 20% compared to monthly billing. For example, the Pro plan is $79/month annually ($948/year) vs $99/month ($1,188/year) - saving you $240 per year."
        }
      ]
    },
    {
      category: "Technical & Support",
      questions: [
        {
          q: "What is your uptime SLA?",
          a: "We guarantee 99.9% uptime for all paid plans. This means less than 8.76 hours of downtime per year. Our actual uptime is typically 99.97%. Enterprise customers can get custom SLAs up to 99.99% with dedicated infrastructure."
        },
        {
          q: "What support do you provide?",
          a: "Free plan: Community support via forums. Starter plan: Email support (24-48h response). Pro plan: Priority email support (12h response) + chat. Enterprise: Dedicated support team + phone support + Slack channel."
        },
        {
          q: "Can I white-label the authentication system?",
          a: "Yes! Pro and Enterprise plans include white-labeling options. You can customize the login pages, emails, and API responses with your branding. Enterprise customers can even use custom domains."
        },
        {
          q: "Do you have webhooks for license events?",
          a: "Yes! We support webhooks for key events: license validation, expiration, user login, HWID changes, and more. This allows you to integrate DEEPAKX999AUTH with your existing systems and workflows."
        },
        {
          q: "What if the DEEPAKX999AUTH server goes down?",
          a: "We have multi-region redundancy and automatic failover. In the unlikely event of an outage, our SDKs include fallback mechanisms and session caching. Enterprise customers can opt for on-premise deployment for complete independence."
        }
      ]
    },
    {
      category: "Use Cases",
      questions: [
        {
          q: "Can I use DEEPAKX999AUTH for desktop applications?",
          a: "Absolutely! DEEPAKX999AUTH is perfect for desktop apps (Windows, macOS, Linux). Our C# SDK is popular for .NET/WPF apps, Python SDK for cross-platform apps, and Java SDK for enterprise desktop software. HWID binding prevents license sharing across computers."
        },
        {
          q: "Does this work for SaaS applications?",
          a: "Yes! Many SaaS companies use DEEPAKX999AUTH for user authentication and subscription management. You can manage user accounts, track login activity, and enforce access controls. The API-first design integrates easily with web apps."
        },
        {
          q: "Can I use this for mobile apps?",
          a: "Yes! Our REST API works with iOS, Android, and React Native apps. Use HWID binding with device identifiers to prevent account sharing. The JavaScript/TypeScript SDK is ideal for React Native."
        },
        {
          q: "Is this suitable for selling software licenses?",
          a: "Perfect! DEEPAKX999AUTH is designed specifically for software licensing. Generate license keys, bind them to hardware, set expiration dates, track usage, and prevent piracy. Integrate with your payment processor to automatically issue licenses upon purchase."
        }
      ]
    }
];

export default function FAQPage() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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

        {/* FAQ Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fadeIn">
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300">
                Everything you need to know about DEEPAKX999AUTH
              </p>
            </div>

            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700 rounded-full"></div>
                  {category.category}
                </h2>

                <div className="space-y-4">
                  {category.questions.map((faq, index) => {
                    const globalIndex = categoryIndex * 100 + index;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={index}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all hover-lift"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <span className="font-semibold text-slate-900 dark:text-white text-lg">
                            {faq.q}
                          </span>
                          <svg
                            className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Still Have Questions */}
            <div className="mt-16 text-center p-8 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Still have questions?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href="mailto:support@authapi.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg font-semibold border-2 border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-slate-400 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Support
                </a>
                <Link
                  href="/dashboard/docs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Read Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}


