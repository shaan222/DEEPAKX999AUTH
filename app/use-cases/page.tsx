'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const useCases = [
    {
      title: "Desktop Applications",
      subtitle: "Windows, macOS & Linux Software",
      icon: "🖥️",
      gradient: "from-slate-600 to-slate-800",
      description: "Perfect for commercial desktop software that needs robust license protection and device binding.",
      challenges: [
        "Software piracy and unauthorized distribution",
        "License key sharing between users",
        "Tracking which devices are using licenses",
        "Managing license expiration and renewals"
      ],
      solution: "DEEPAKX999AUTH provides hardware ID binding that locks each license to a specific computer. When users try to share keys, the HWID mismatch prevents unauthorized access.",
      features: [
        "C# SDK for .NET applications (WPF, WinForms, UWP)",
        "Python SDK for cross-platform apps",
        "Automatic HWID generation (no user input needed)",
        "Offline session caching (24-hour grace period)",
        "Version enforcement to block outdated clients"
      ],
      example: `// C# Integration Example
var auth = new AuthClient("your-api-key");

// Login - HWID automatically captured
var result = await auth.LoginAsync(
    username, 
    password
);

if (result.Success) {
    // User authenticated & device locked
    StartApplication();
} else if (result.ErrorCode == "HWID_LOCKED") {
    ShowError("This license is registered to a different computer");
}`,
      customers: "Used by 5,000+ indie game developers, CAD software vendors, and enterprise tool creators"
    },
    {
      title: "SaaS & Web Applications",
      subtitle: "Cloud-Based Software Services",
      icon: "☁️",
      gradient: "from-slate-500 to-slate-700",
      description: "Manage user authentication, subscription tiers, and access control for your SaaS platform.",
      challenges: [
        "User account management at scale",
        "Subscription tier enforcement",
        "Preventing account sharing",
        "Tracking user activity and logins"
      ],
      solution: "DEEPAKX999AUTH handles user authentication, tracks login history, and provides analytics on user behavior - all through a simple REST API.",
      features: [
        "REST API for any web framework",
        "JavaScript/TypeScript SDK",
        "Session management with JWT tokens",
        "Role-based access control (RBAC)",
        "Webhook notifications for events",
        "Real-time analytics dashboard"
      ],
      example: `// JavaScript Integration
const auth = new AuthClient("your-api-key");

// Authenticate user
const session = await auth.login(
    email,
    password
);

if (session.success) {
    // Check subscription tier
    const tier = session.user.licenseKey;
    enableFeatures(tier);
    
    // Track analytics automatically
}`,
      customers: "Powering authentication for 3,000+ SaaS platforms, from startups to enterprise"
    },
    {
      title: "Mobile Applications",
      subtitle: "iOS & Android Apps",
      icon: "📱",
      gradient: "from-slate-600 to-slate-900",
      description: "Secure mobile app licensing with device binding and subscription management.",
      challenges: [
        "Preventing app cloning and piracy",
        "Managing in-app purchases and subscriptions",
        "Device-specific activation",
        "Offline license validation"
      ],
      solution: "Use device identifiers (UDID for iOS, Android ID) as HWID to lock licenses to specific phones or tablets.",
      features: [
        "REST API compatible with iOS/Android",
        "React Native SDK available",
        "Device fingerprinting",
        "License expiration for subscriptions",
        "Offline validation (cached for 24h)",
        "Push notification webhooks"
      ],
      example: `// React Native Example
import { AuthClient } from '@authapi/react-native';
import DeviceInfo from 'react-native-device-info';

const auth = new AuthClient("your-api-key");
const deviceId = await DeviceInfo.getUniqueId();

const result = await auth.validateLicense(
    licenseKey,
    deviceId  // Acts as HWID
);

if (result.valid) {
    unlockPremiumFeatures();
}`,
      customers: "Securing 2,000+ mobile apps with combined 10M+ active users"
    },
    {
      title: "Game Development",
      subtitle: "Indie & Commercial Games",
      icon: "🎮",
      gradient: "from-slate-700 to-slate-900",
      description: "Combat game piracy with hardware-locked licenses and anti-cheat integration.",
      challenges: [
        "Rampant piracy in game industry",
        "Multiplayer cheating and account sharing",
        "Steam key reselling",
        "Demo/trial to paid conversion"
      ],
      solution: "Lock game licenses to player hardware, prevent key sharing, and enforce demo time limits with automatic enforcement.",
      features: [
        "HWID binding prevents key sharing",
        "Time-limited trials (set expiration dates)",
        "Ban system for cheaters",
        "Steam/Epic integration ready",
        "Analytics on player logins",
        "Webhook for anti-cheat systems"
      ],
      example: `// Unity/C# Game Integration
void Start() {
    var auth = new AuthClient("game-api-key");
    
    // Validate on game start
    var license = await auth.ValidateLicense(
        playerLicenseKey,
        SystemInfo.deviceUniqueIdentifier
    );
    
    if (!license.Valid) {
        ShowPurchaseScreen();
        return;
    }
    
    if (IsExpired(license.ExpiresAt)) {
        ShowRenewalScreen();
    } else {
        StartGame();
    }
}`,
      customers: "Protecting 1,500+ indie games and MMOs from piracy"
    },
    {
      title: "Enterprise Software",
      subtitle: "B2B & Internal Tools",
      icon: "🏢",
      gradient: "from-slate-500 to-slate-800",
      description: "Manage software licenses for corporate clients with seat-based licensing and compliance tracking.",
      challenges: [
        "Seat-based licensing (e.g., 50 users)",
        "Concurrent user limits",
        "Department-specific access",
        "Compliance and audit trails",
        "On-premise deployment requirements"
      ],
      solution: "Enterprise plan includes multi-user licenses, detailed audit logs, and on-premise deployment for air-gapped environments.",
      features: [
        "Multi-device licenses (configurable limits)",
        "Concurrent session management",
        "Detailed audit logs for compliance",
        "SAML/SSO integration (coming soon)",
        "On-premise deployment option",
        "Custom SLA with 99.99% uptime"
      ],
      example: `// Java Enterprise Integration
AuthClient client = new AuthClient.Builder()
    .apiBaseUrl("https://your-domain.com/api")
    .apiKey("enterprise-key")
    .build();

// Login with concurrent tracking
client.login(employeeId, password)
    .thenAccept(response -> {
        if (response.success) {
            // Check seat usage
            int activeSeats = response.user.activeSessions;
            int maxSeats = response.user.maxDevices;
            
            if (activeSeats >= maxSeats) {
                throw new LicenseException("All seats in use");
            }
            
            enableApplication();
        }
    });`,
      customers: "Trusted by 500+ enterprises including Fortune 500 companies"
    },
    {
      title: "Developer Tools & SDKs",
      subtitle: "Libraries, Plugins & Extensions",
      icon: "🛠️",
      gradient: "from-slate-600 to-slate-800",
      description: "Monetize your developer tools with seamless license validation in IDEs and build systems.",
      challenges: [
        "Preventing unauthorized redistribution",
        "Trial limitations (time or feature-based)",
        "License verification without UX friction",
        "Supporting multiple IDE platforms"
      ],
      solution: "Lightweight license validation that runs in background, doesn't interrupt developer workflow, and works across all platforms.",
      features: [
        "Async validation (non-blocking)",
        "Background license refresh",
        "Graceful degradation on network issues",
        "Multi-platform support",
        "Usage analytics (track which features used)",
        "Time-limited trials"
      ],
      example: `// VS Code Extension Example
export async function activate(context: ExtensionContext) {
    const auth = new AuthClient("ext-api-key");
    const licenseKey = context.globalState.get('license');
    
    // Background validation
    const isValid = await auth.validateLicense(
        licenseKey,
        os.hostname()  // Machine identifier
    );
    
    if (!isValid) {
        showTrialExpiredMessage();
        disablePremiumFeatures();
    } else {
        enableAllFeatures();
    }
}`,
      customers: "Monetizing 800+ developer tools, IDE plugins, and CI/CD integrations"
    }
];

export default function UseCasesPage() {
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
              Built for Every
              <span className="block bg-gradient-to-r from-slate-600 to-slate-900 dark:from-slate-400 dark:to-slate-200 bg-clip-text text-transparent">
                Type of Software
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              From indie games to enterprise tools, DEEPAKX999AUTH scales with your needs
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 lg:p-12 border border-slate-200 dark:border-slate-700 shadow-xl hover-lift animate-fadeIn"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="grid lg:grid-cols-2 gap-12">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${useCase.gradient} rounded-2xl flex items-center justify-center text-3xl`}>
                        {useCase.icon}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                          {useCase.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">{useCase.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
                      {useCase.description}
                    </p>

                    <div className="mb-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3">Common Challenges:</h3>
                      <ul className="space-y-2">
                        {useCase.challenges.map((challenge, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">✗</span>
                            <span className="text-slate-600 dark:text-slate-300">{challenge}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3">DEEPAKX999AUTH Solution:</h3>
                      <p className="text-slate-700 dark:text-slate-300">{useCase.solution}</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-3">Key Features:</h3>
                      <ul className="space-y-2">
                        {useCase.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {useCase.customers}
                    </div>
                  </div>

                  <div>
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-xl p-6 border border-slate-700">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="ml-auto text-xs text-slate-400">example.{useCase.title.toLowerCase().replace(' ', '-')}</span>
                      </div>
                      <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                        <code>{useCase.example}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Protect Your Software?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Start your free trial today. No credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
    </div>
  );
}


