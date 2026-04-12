'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PublicDocsPage() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<'quickstart' | 'api' | 'sdks' | 'examples'>('quickstart');

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-2">
                <button
                  onClick={() => setActiveSection('quickstart')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'quickstart'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ⚡ Quick Start
                </button>
                <button
                  onClick={() => setActiveSection('api')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'api'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  📡 API Reference
                </button>
                <button
                  onClick={() => setActiveSection('sdks')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'sdks'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  💻 SDKs & Libraries
                </button>
                <button
                  onClick={() => setActiveSection('examples')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeSection === 'examples'
                      ? 'bg-slate-900 dark:bg-slate-700 text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  📚 Code Examples
                </button>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    href="/dashboard/docs"
                    className="block w-full text-left px-4 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-white hover:shadow-lg transition-all"
                  >
                    🔐 Full Docs (Login Required)
                  </Link>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeSection === 'quickstart' && <QuickStartSection />}
              {activeSection === 'api' && <APIReferenceSection />}
              {activeSection === 'sdks' && <SDKsSection />}
              {activeSection === 'examples' && <ExamplesSection />}
            </div>
          </div>
        </div>
    </div>
  );
}

function QuickStartSection() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Quick Start Guide</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Get started with DEEPAKX999AUTH in under 5 minutes. No credit card required.
        </p>
      </div>

      {/* Step 1 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center font-bold">1</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign Up & Create Application</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Create your free account and set up your first application. You'll get an API key instantly.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Sign Up Free
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* Step 2 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center font-bold">2</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Choose Your SDK</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Download the SDK for your programming language:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="font-semibold text-slate-900 dark:text-white mb-2">C# / .NET</div>
            <code className="text-sm text-slate-600 dark:text-slate-300">AuthClient.cs</code>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="font-semibold text-slate-900 dark:text-white mb-2">Python</div>
            <code className="text-sm text-slate-600 dark:text-slate-300">auth_client.py</code>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="font-semibold text-slate-900 dark:text-white mb-2">Java</div>
            <code className="text-sm text-slate-600 dark:text-slate-300">AuthClient.java</code>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="font-semibold text-slate-900 dark:text-white mb-2">REST API</div>
            <code className="text-sm text-slate-600 dark:text-slate-300">Any Language</code>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center font-bold">3</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Integrate & Test</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Add the SDK to your project and test authentication:
        </p>
        <div className="bg-slate-900 rounded-lg p-4">
          <pre className="text-sm text-green-400 font-mono overflow-x-auto">
            <code>{`// C# Example
var auth = new AuthClient("sk_YOUR_API_KEY");
var result = await auth.LoginAsync("username", "password");

if (result.Success) {
    Console.WriteLine("✅ Logged in!");
    Console.WriteLine($"HWID: {result.User.Hwid}");
} else {
    Console.WriteLine($"❌ Error: {result.Message}");
}`}</code>
          </pre>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">✅ You're All Set!</h3>
        <p className="text-slate-700 dark:text-slate-300">
          Your application is now protected with hardware ID binding and license validation.
        </p>
      </div>
    </div>
  );
}

function APIReferenceSection() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">API Reference</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
        Complete REST API documentation for DEEPAKX999AUTH.
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Base URL</h2>
        <code className="block bg-slate-900 text-green-400 p-4 rounded-lg font-mono">
          https://www.DEEPAKX999AUTH.space/api
        </code>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Authentication Endpoints</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-mono rounded">POST</span>
              <code className="text-slate-900 dark:text-white">/api/user/login</code>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-3">Authenticate a user and capture device HWID</p>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Request Body:</div>
              <pre className="text-sm text-slate-600 dark:text-slate-300 font-mono overflow-x-auto">
{`{
  "apiKey": "sk_your_api_key",
  "username": "user123",
  "password": "password",
  "version": "1.0.0"
}`}
              </pre>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-mono rounded">POST</span>
              <code className="text-slate-900 dark:text-white">/api/auth/validate</code>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Validate a license key</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-mono rounded">GET</span>
              <code className="text-slate-900 dark:text-white">/api/user/info</code>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Get user information</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">🔐 Full Documentation</h3>
        <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4">
          Complete API documentation with all endpoints, parameters, and examples is available after sign-in.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          Sign In to View Full Docs
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function SDKsSection() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">SDKs & Libraries</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
        Official SDKs for all major programming languages.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">C# / .NET SDK</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Full-featured SDK for Windows desktop apps, WPF, WinForms, and UWP.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
            <li>✓ Automatic HWID generation</li>
            <li>✓ JWT token management</li>
            <li>✓ AES-256 encryption</li>
            <li>✓ Certificate pinning</li>
          </ul>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            Download SDK
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Python SDK</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Cross-platform SDK for Python 3.7+ applications.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
            <li>✓ OS-specific HWID generation</li>
            <li>✓ Async/await support</li>
            <li>✓ AES-256-GCM encryption</li>
            <li>✓ Secure credential storage</li>
          </ul>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            Download SDK
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Java SDK</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Enterprise-grade SDK using OSHI for hardware detection.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
            <li>✓ OSHI-based HWID generation</li>
            <li>✓ OkHttp async operations</li>
            <li>✓ Bouncy Castle encryption</li>
            <li>✓ Java Keystore integration</li>
          </ul>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            Download SDK
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">REST API</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Use our REST API with any programming language.
          </p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
            <li>✓ Language agnostic</li>
            <li>✓ JSON responses</li>
            <li>✓ OpenAPI/Swagger docs</li>
            <li>✓ Webhook support</li>
          </ul>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm"
          >
            View API Docs
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExamplesSection() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Code Examples</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
        Ready-to-use code snippets for common scenarios.
      </p>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Basic User Login (C#)</h3>
          <div className="bg-slate-900 rounded-lg p-4">
            <pre className="text-sm text-green-400 font-mono overflow-x-auto">
              <code>{`using System;
using DEEPAKX999AUTH;

class Program {
    static async Task Main() {
        var client = new AuthClient("sk_your_api_key");
        
        var result = await client.LoginAsync("username", "password");
        
        if (result.Success) {
            Console.WriteLine($"Welcome {result.User.Username}!");
            Console.WriteLine($"HWID: {result.User.Hwid}");
            Console.WriteLine($"Last Login: {result.User.LastLoginAt}");
        } else {
            Console.WriteLine($"Login failed: {result.Message}");
        }
    }
}`}</code>
            </pre>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">License Validation (Python)</h3>
          <div className="bg-slate-900 rounded-lg p-4">
            <pre className="text-sm text-green-400 font-mono overflow-x-auto">
              <code>{`from auth_client import AuthClient

client = AuthClient("sk_your_api_key")

# Validate license key
result = client.validate_license("LICENSE-KEY-123")

if result['valid']:
    print(f"✅ License valid until {result['expires_at']}")
    print(f"Devices: {result['bound_devices']}/{result['max_devices']}")
else:
    print(f"❌ Invalid license: {result['message']}")`}</code>
            </pre>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Version Check (Java)</h3>
          <div className="bg-slate-900 rounded-lg p-4">
            <pre className="text-sm text-green-400 font-mono overflow-x-auto">
              <code>{`AuthClient client = new AuthClient.Builder()
    .apiKey("sk_your_api_key")
    .build();

try {
    LoginResponse response = client.login("username", "password", "2.0.0");
    System.out.println("Login successful!");
    System.out.println("User: " + response.getUser().getUsername());
} catch (VersionTooOldException e) {
    System.out.println("Please update to version " + e.getMinimumVersion());
} catch (AuthException e) {
    System.out.println("Error: " + e.getMessage());
}`}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Need More Examples?</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          Hundreds of additional examples and use cases are available in the full documentation.
        </p>
        <Link
          href="/use-cases"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          View Use Cases
        </Link>
      </div>
    </div>
  );
}

