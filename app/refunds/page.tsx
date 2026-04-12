'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RefundsPage() {
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
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Cancellation & Refund Policy</h1>
          <p className="text-slate-600 dark:text-slate-400">Last updated: November 7, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Service Scope Reminder:</strong> DEEPAKX999AUTH offers authentication, licensing, and security automation tools for software creators. We do not sell or develop games or entertainment products, and payments processed through DEEPAKX999AUTH relate strictly to our software infrastructure services.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">1. Overview</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              At DEEPAKX999AUTH, we want you to be completely satisfied with our service. This Cancellation & Refund Policy explains your rights regarding subscription cancellations and refunds.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">2. Free Plan</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Our Free Plan does not require payment and can be used indefinitely. You can delete your account at any time from your dashboard settings. No refunds are applicable as no payment is required.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">3. Paid Subscriptions (Pro & Advance Plans)</h2>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">3.1 Subscription Billing</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li><strong>Pro Plan:</strong> ₹1,649/month (approximately $19.99 USD)</li>
              <li><strong>Advance Plan:</strong> ₹4,149/month (approximately $49.99 USD)</li>
              <li>All subscriptions are billed monthly in advance through Razorpay</li>
              <li>Subscription auto-renews on the same date each month unless cancelled</li>
              <li>Prices are subject to change with 30 days' notice</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">3.2 Cancellation Policy</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You can cancel your subscription at any time by:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Logging into your DEEPAKX999AUTH dashboard</li>
              <li>Navigating to <strong>Settings → Subscription</strong></li>
              <li>Clicking the <strong>"Cancel Subscription"</strong> button</li>
              <li>Or contacting our support team at <strong>support@DEEPAKX999AUTH.space</strong></li>
            </ul>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              <strong>Important:</strong> When you cancel your subscription, you will retain access to paid features until the end of your current billing period. After that, your account will automatically downgrade to the Free Plan.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">4. Refund Policy</h2>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">4.1 7-Day Money-Back Guarantee</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              We offer a <strong>7-day money-back guarantee</strong> for first-time Pro and Advance plan subscribers:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Applies only to your <strong>first payment</strong> for a paid plan</li>
              <li>Must be requested within <strong>7 days</strong> of the initial purchase date</li>
              <li>Full refund will be processed to your original payment method</li>
              <li>Refund typically takes 5-10 business days to appear in your account</li>
              <li>After the 7-day period, all payments are non-refundable</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">4.2 Partial Refunds</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We do not provide pro-rated or partial refunds for cancelled subscriptions. If you cancel during your billing period, you will retain access to paid features until the end of that period, but no refund will be issued for unused time.
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-6 mb-3">4.3 Exceptions to Refund Policy</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Refunds may be granted outside the 7-day window in the following exceptional circumstances:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li><strong>Service Unavailability:</strong> Extended service outages (more than 48 hours) caused by DEEPAKX999AUTH</li>
              <li><strong>Billing Errors:</strong> Duplicate charges or incorrect amounts charged</li>
              <li><strong>Technical Issues:</strong> Critical bugs that prevent core functionality (if not resolved within 5 business days)</li>
              <li><strong>Fraudulent Charges:</strong> Unauthorized charges to your account</li>
            </ul>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              All refund requests will be reviewed on a case-by-case basis. Contact our support team with documentation of the issue to request an exception.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">5. How to Request a Refund</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-3">
              <li>Send an email to <strong>support@DEEPAKX999AUTH.space</strong> with the subject line: <strong>"Refund Request"</strong></li>
              <li>Include your account email address and order/transaction ID</li>
              <li>Provide a brief reason for your refund request</li>
              <li>Our team will respond within 2 business days</li>
              <li>If approved, refunds are processed within 5-7 business days</li>
              <li>You will receive a confirmation email once the refund is processed</li>
            </ol>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">6. Downgrades</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You can downgrade your subscription plan at any time. Downgrades take effect at the start of your next billing cycle. No refunds or credits are provided for the difference in price between plans.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">7. Upgrades</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              When you upgrade from a lower-tier plan to a higher-tier plan, you will be charged the difference immediately on a pro-rated basis for the remainder of your current billing cycle. Your next full billing cycle will be at the new plan's rate.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">8. Failed Payments</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If a recurring payment fails:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>We will attempt to charge your payment method up to 3 times over 7 days</li>
              <li>You will receive email notifications about failed payment attempts</li>
              <li>If all attempts fail, your account will automatically downgrade to the Free Plan</li>
              <li>No refunds are provided for accounts downgraded due to failed payments</li>
              <li>You can reactivate your subscription at any time by updating your payment method</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">9. Account Termination</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              If we terminate your account for violation of our Terms of Service:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>No refunds will be provided</li>
              <li>You will lose access to all account data immediately</li>
              <li>Outstanding payments remain due</li>
              <li>You may be prohibited from creating new accounts</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">10. Taxes and Fees</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              All prices are exclusive of applicable taxes (GST, VAT, etc.) which will be added at checkout based on your billing location. Razorpay payment processing fees are non-refundable.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">11. Data Retention After Cancellation</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              After cancellation or downgrade to Free Plan:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 mb-6 space-y-2">
              <li>Your data is retained for 90 days to allow for reactivation</li>
              <li>You can export your data from the dashboard during this period</li>
              <li>After 90 days, data exceeding Free Plan limits may be automatically deleted</li>
              <li>We recommend exporting critical data before cancelling if you exceed Free Plan limits</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">12. Dispute Resolution</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              If you believe you were charged incorrectly or have a billing dispute, please contact us first at <strong>support@DEEPAKX999AUTH.space</strong> before initiating a chargeback with your payment provider. We are committed to resolving all billing issues fairly and promptly.
            </p>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              <strong>Important:</strong> Initiating a chargeback without contacting us first may result in immediate account suspension pending resolution.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">13. Changes to This Policy</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We reserve the right to modify this Cancellation & Refund Policy at any time. Changes will be posted on this page with an updated "Last updated" date. Material changes will be communicated via email to active subscribers at least 30 days in advance.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">14. Contact Information</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              For questions about this policy or to request a cancellation or refund, please contact:
            </p>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-6">
              <p className="text-slate-900 dark:text-white font-semibold mb-3">DEEPAKX999AUTH Support Team</p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Email:</strong> support@DEEPAKX999AUTH.space</li>
                <li><strong>Contact Form:</strong> <Link href="/contact" className="text-slate-900 dark:text-white hover:underline">www.DEEPAKX999AUTH.space/contact</Link></li>
                <li><strong>Response Time:</strong> Within 2 business days</li>
                <li><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST</li>
              </ul>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-300">
                <strong>💡 Pro Tip:</strong> Try our Free Plan first to test all features before committing to a paid subscription. This helps ensure DEEPAKX999AUTH meets your needs!
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
            href="/privacy"
            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all text-center"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Privacy Policy</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Learn how we protect your data</p>
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


