'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-600 dark:text-slate-400">Last updated: November 7, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Who We Are:</strong> DEEPAKX999AUTH is a B2B authentication and license management platform. We help businesses protect their software products with secure user verification, device binding, and compliance tooling. We do not create, publish, or distribute games or entertainment content, and we do not provide custom game development services.
              </p>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Email address and password (for account creation)</li>
              <li>Google account information (if you sign in with Google)</li>
              <li>Application and license information</li>
              <li>Payment information (processed securely through Razorpay - we do not store full credit card details)</li>
              <li>Hardware ID (HWID) and IP address information for license binding</li>
              <li>Device information for multi-device license management</li>
              <li>Usage data and analytics</li>
              <li>API usage logs and security event data</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Protect against fraud and abuse</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>With your consent</li>
              <li>With service providers who assist in our operations</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Data Security</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We use industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication with Firebase</li>
              <li>Google reCAPTCHA Enterprise for bot protection</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and monitoring</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. Cookies and Tracking</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We use cookies and similar tracking technologies to improve your experience. This includes:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Essential cookies for authentication and functionality</li>
              <li>Analytics cookies (Google Analytics) to understand usage patterns</li>
              <li>Preference cookies to remember your settings</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You can control cookies through your browser settings.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Third-Party Services</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We use the following third-party services that may collect and process your data:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li><strong>Firebase (Google)</strong> - Authentication, database, and hosting services</li>
              <li><strong>Razorpay</strong> - Payment processing (they have their own privacy policy)</li>
              <li><strong>Google Analytics</strong> - Usage analytics and insights</li>
              <li><strong>Google reCAPTCHA Enterprise</strong> - Bot protection and security</li>
              <li><strong>Vercel</strong> - Web hosting and deployment services</li>
              <li><strong>IP-API</strong> - IP geolocation services for license tracking</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Each third-party service has its own privacy policy. We encourage you to review their policies:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Razorpay Privacy Policy: <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white hover:underline">razorpay.com/privacy</a></li>
              <li>Google Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white hover:underline">policies.google.com/privacy</a></li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">7. Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">8. Data Retention</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We retain your information for as long as your account is active or as needed to provide services. You can request deletion of your account at any time from your dashboard settings.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">9. Children's Privacy</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">10. International Data Transfers</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">11. Changes to This Policy</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">12. Payment Data Protection</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              All payment transactions are processed through Razorpay, a PCI DSS compliant payment gateway. We do not store your complete credit card information on our servers. Only Razorpay has access to your full payment details. We receive only limited information such as transaction ID and payment status.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">13. HWID and Device Tracking</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We collect and store hardware IDs (HWIDs) and device information to enforce license limits and prevent unauthorized sharing. All HWIDs are cryptographically hashed (SHA-256) before storage. This data is used solely for license management and fraud prevention.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">14. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-6">
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Email:</strong> support@DEEPAKX999AUTH.space</li>
                <li><strong>Contact Form:</strong> <Link href="/contact" className="text-slate-900 dark:text-white hover:underline">www.DEEPAKX999AUTH.space/contact</Link></li>
                <li><strong>Data Protection Officer:</strong> Available upon request</li>
              </ul>
            </div>

            <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-300">
                <strong>🔒 Your Privacy Matters:</strong> We are committed to protecting your personal information and maintaining transparency about our data practices. You have full control over your data and can request access, correction, or deletion at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Link
            href="/terms"
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-center"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Terms & Conditions</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Read our terms of service</p>
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


