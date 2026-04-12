'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
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
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Terms & Conditions</h1>
          <p className="text-slate-600 dark:text-slate-400">Last updated: November 7, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Our Business:</strong> DEEPAKX999AUTH is a secure authentication and license management platform for software creators. We do not develop, publish, or monetize games, gambling, or entertainment content. All references to "services" in this document relate to our software-as-a-service tools that help teams protect and manage their own applications.
              </p>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              By accessing and using DEEPAKX999AUTH, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              DEEPAKX999AUTH is a cloud-based authentication and license management platform that helps legitimate software businesses secure their applications. We focus on compliance-friendly protection for SaaS platforms, desktop software, web applications, browser extensions, and mobile apps. DEEPAKX999AUTH does not design, develop, publish, or distribute games.
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>License key generation and management</li>
              <li>User authentication and authorization</li>
              <li>Hardware ID (HWID) binding</li>
              <li>Application protection features</li>
              <li>Reseller management system</li>
              <li>API access for integration</li>
            </ul>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Business Scope:</strong> DEEPAKX999AUTH is a security and authentication infrastructure provider. Our services are used to manage software licensing, protect digital intellectual property, and secure user access for third-party applications. We do not provide custom software or game development services.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Account Registration</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You must register for an account to use our services. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Subscription Plans and Billing</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We offer multiple subscription plans:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li><strong>Free Plan:</strong> 2 applications, 25 users per app, 1 reseller per app</li>
              <li><strong>Pro Plan ($19.99/month):</strong> 25 applications, 500 users per app, 10 resellers per app</li>
              <li><strong>Advance Plan ($49.99/month):</strong> 70 applications, 850 users per app, 45 resellers per app</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Subscription fees are billed in advance on a recurring monthly basis through Razorpay payment gateway. All fees are non-refundable except as required by law or as specified in our Refund Policy.
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You can upgrade, downgrade, or cancel your subscription at any time from your dashboard. Changes will take effect at the start of your next billing cycle.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. Acceptable Use</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Resell or redistribute the service without authorization</li>
              <li>Use the service to distribute malware or harmful content</li>
              <li>Misrepresent DEEPAKX999AUTH as a game development or distribution platform</li>
            </ul>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              DEEPAKX999AUTH operates solely as an authentication, licensing, and compliance solution. Customers may integrate DEEPAKX999AUTH into their own software workflows, but DEEPAKX999AUTH does not participate in the development, publishing, hosting, or monetization of video games or related gaming services. By using our platform, you agree not to market or describe DEEPAKX999AUTH as a game development service.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Intellectual Property</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The service and its original content, features, and functionality are owned by DEEPAKX999AUTH and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">7. API Usage</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              When using our API, you agree to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Respect rate limits and usage quotas</li>
              <li>Keep your API keys secure</li>
              <li>Not share your API keys publicly</li>
              <li>Use the API only for legitimate purposes</li>
              <li>Follow our API documentation and best practices</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">8. Reseller Program</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              If you use our reseller features, you agree to use them only for legitimate business purposes. You are responsible for your resellers' actions and must ensure they comply with these terms.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">9. Data and Privacy</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your use of the service is also governed by our Privacy Policy. By using the service, you consent to the collection and use of information as described in our Privacy Policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">10. Service Availability</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We strive to provide reliable service but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any aspect of the service at any time.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">11. Termination</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including breach of these terms. Upon termination, your right to use the service will immediately cease.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">12. Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              In no event shall DEEPAKX999AUTH, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">13. Disclaimer</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">14. Governing Law</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              These terms shall be governed and construed in accordance with applicable laws, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">15. Changes to Terms</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We reserve the right to modify or replace these terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">16. Payment Processing</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              All payments are processed securely through Razorpay, our payment gateway partner. We do not store your full credit card details. By making a payment, you agree to Razorpay's terms and conditions.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">17. Service Classification</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              DEEPAKX999AUTH is classified as a Business-to-Business (B2B) software-as-a-service provider delivering authentication, licensing, and security automation tools. Our platform is designed for developers and organizations that already own their digital products and need to secure them with industry-standard authentication workflows. We do not offer entertainment, gambling, or gaming production services.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">18. Contact</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Email: support@DEEPAKX999AUTH.space</li>
              <li>Contact Page: <Link href="/contact" className="text-slate-900 dark:text-white hover:underline">www.DEEPAKX999AUTH.space/contact</Link></li>
              <li>Dashboard Support: Available for logged-in users</li>
            </ul>

            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Important:</strong> By using DEEPAKX999AUTH, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Link
            href="/privacy"
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-center"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Privacy Policy</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Learn how we protect your data</p>
          </Link>
          <Link
            href="/refunds"
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-center"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Refund Policy</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">View our cancellation terms</p>
          </Link>
          <Link
            href="/contact"
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-center"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Contact Us</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Get help from our team</p>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            © 2025 DEEPAKX999AUTH. All rights reserved. Built with ❤️ by MD. FAIZAN & Shivam Jnath
          </p>
        </div>
      </footer>
    </div>
  );
}


