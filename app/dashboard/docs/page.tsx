/**
 * Protected Documentation Page
 * 
 * Only accessible to authenticated users through the website
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';

export default function DocumentationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'quickstart' | 'hwid' | 'integration' | 'api' | 'troubleshooting'>('quickstart');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/unauthorized');
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading documentation...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Quick Start Guide 🚀
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Get started with the DEEPAKX999AUTH System in minutes
            </p>
          </div>
        </ScrollAnimateWrapper>

        {/* Security Notice */}
        <ScrollAnimateWrapper animation="scale">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Protected Documentation</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This documentation is only accessible to authenticated users for security reasons.
                </p>
              </div>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Step Navigation */}
        <ScrollAnimateWrapper animation="slide-left">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('quickstart')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'quickstart'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              ⚡ Quick Start (5 min)
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'integration'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Integration Steps
            </button>
            <button
              onClick={() => setActiveTab('hwid')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'hwid'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              HWID Setup
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'api'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              API Basics
            </button>
            <button
              onClick={() => setActiveTab('troubleshooting')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'troubleshooting'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Troubleshooting
            </button>
          </div>
        </ScrollAnimateWrapper>

        {/* Content */}
        <ScrollAnimateWrapper animation="fade" delay={100}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 md:p-8">
            {activeTab === 'quickstart' && (
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Start (5 minutes)</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Follow these simple steps to integrate DEEPAKX999AUTH into your application.</p>
                
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: 'Create an Application',
                      description: 'Go to the Applications page and create a new app. You\'ll receive an API key.'
                    },
                    {
                      step: 2,
                      title: 'Create Users',
                      description: 'Navigate to Users & Clients and create users for your application with usernames and passwords.'
                    },
                    {
                      step: 3,
                      title: 'Integrate into Your App',
                      description: 'Use the provided code examples to authenticate users in your application.'
                    },
                    {
                      step: 4,
                      title: 'Test',
                      description: 'Test the login functionality with your created users.'
                    }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 rounded-full flex items-center justify-center text-white font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-1">✅ That's it!</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your application is now protected with authentication. Check the other tabs for detailed integration examples and HWID setup.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'integration' && (
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Integration Steps</h2>
                <div className="space-y-6 text-slate-700 dark:text-slate-300">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">1. Install Dependencies</h3>
                    <p className="mb-3">No additional packages required! The API uses standard HTTP requests.</p>
                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{`// For Node.js: built-in fetch (Node 18+) or axios
// For browsers: built-in fetch
// For C#: HttpClient
// For Python: requests library`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">2. Configure API Credentials</h3>
                    <p className="mb-3">Get your API credentials from the Applications page.</p>
                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{`const API_KEY = "your-api-key";
const BASE_URL = "https://www.DEEPAKX999AUTH.space/api";`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">3. Implement Login</h3>
                    <p className="mb-3">Call the login endpoint with username and password.</p>
                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{`const response = await fetch(\`\${BASE_URL}/user/login\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: API_KEY,
    username: "user123",
    password: "password",
    hwid: generateHWID() // See HWID Setup tab
  })
});
const data = await response.json();`}</code>
                    </pre>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">4. Handle Response</h3>
                    <p className="mb-3">Check if login was successful and handle the user data.</p>
                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{`if (data.success) {
  console.log("Login successful!", data.user);
  // Store user session, redirect, etc.
} else {
  console.error("Login failed:", data.message);
  // Show error to user
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hwid' && (
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">HWID Setup</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Hardware ID (HWID) binds users to specific devices for enhanced security.
                </p>

                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-1">⚠️ Important</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      HWID is automatically captured from the user's device on first login. No manual generation needed!
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">How it Works</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
                      <li>User logs in for the first time</li>
                      <li>System captures their device's unique HWID</li>
                      <li>HWID is locked to that device</li>
                      <li>Future logins must come from the same device</li>
                      <li>Admins can reset HWID if needed</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Optional: Custom HWID Generation</h3>
                    <p className="mb-3 text-slate-600 dark:text-slate-400">If you want to generate HWID on the client side, use these methods:</p>
                    <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{`// Node.js
const os = require('os');
const crypto = require('crypto');
function generateHWID() {
  const cpus = os.cpus().map(cpu => cpu.model).join('');
  const platform = os.platform() + os.arch();
  return crypto.createHash('sha256')
    .update(cpus + platform)
    .digest('hex');
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">API Basics</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Core API endpoints you'll use.</p>

                <div className="space-y-6">
                  {[
                    {
                      method: 'POST',
                      endpoint: '/api/user/login',
                      description: 'Authenticate a user',
                      color: 'green'
                    },
                    {
                      method: 'POST',
                      endpoint: '/api/auth/validate',
                      description: 'Validate license key',
                      color: 'blue'
                    },
                    {
                      method: 'POST',
                      endpoint: '/api/user/reset-hwid',
                      description: 'Reset user HWID (admin)',
                      color: 'orange'
                    }
                  ].map((api, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded ${
                          api.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                          api.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                        }`}>
                          {api.method}
                        </span>
                        <code className="text-sm text-slate-900 dark:text-white font-mono">{api.endpoint}</code>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{api.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">💡 Tip</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Check the Users & Clients page for complete code examples in multiple languages!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'troubleshooting' && (
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Troubleshooting</h2>
                
                <div className="space-y-6">
                  {[
                    {
                      issue: 'HWID Locked Error',
                      solution: 'User is trying to login from a different device. Reset their HWID from the Users page or ask them to use the original device.'
                    },
                    {
                      issue: 'Invalid API Key',
                      solution: 'Check that you\'re using the correct API key from the Applications page. Make sure there are no extra spaces.'
                    },
                    {
                      issue: 'User Banned/Paused',
                      solution: 'Check the user\'s status in the Users page. Unban or unpause them if needed.'
                    },
                    {
                      issue: 'Version Mismatch',
                      solution: 'User\'s app version is below the minimum required. Update the app version or adjust the minimum version requirement.'
                    },
                    {
                      issue: 'License Expired',
                      solution: 'The user\'s account has expired. Extend the expiration date from the Users page.'
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-l-4 border-orange-500">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">❌ {item.issue}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400"><strong>Solution:</strong> {item.solution}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">📧 Need Help?</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    If you're still experiencing issues, check your application logs and verify all credentials are correct.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollAnimateWrapper>
      </div>
    </DashboardLayout>
  );
}
