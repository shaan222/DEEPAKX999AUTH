'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';
import { formatDate } from '@/lib/utils';

interface Application {
  id: string;
  name: string;
  apiKey: string;
  description?: string;
  createdAt: string;
  isActive: boolean;
  currentVersion?: string;
  minimumVersion?: string;
}

interface License {
  id: string;
  key: string;
  userId: string;
  status: 'active' | 'expired' | 'banned';
  expiryDate: string;
  maxDevices: number;
  devices: string[];
  createdAt: string;
}

type Language = 'csharp' | 'python' | 'java' | 'javascript' | 'nodejs';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState<Language>('csharp');
  const [showApiKey, setShowApiKey] = useState(false);

  const appId = params?.id as string;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.DEEPAKX999AUTH.space';

  useEffect(() => {
    if (appId) {
      fetchApplicationData();
    }
  }, [appId]);

  const fetchApplicationData = async () => {
    try {
      const token = await user?.getIdToken();
      
      // Fetch application details
      const appResponse = await fetch('/api/application/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appData = await appResponse.json();
      const app = appData.applications?.find((a: Application) => a.id === appId);
      
      if (!app) {
        toast.error('Application not found');
        router.push('/dashboard/applications');
        return;
      }
      
      setApplication(app);

      // Fetch licenses for this application
      const licenseResponse = await fetch(`/api/admin/license-details?appId=${appId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const licenseData = await licenseResponse.json();
      setLicenses(licenseData.licenses || []);
      
    } catch {
      toast.error('Failed to load application data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const languages = [
    { id: 'csharp', name: 'C#', icon: '🔷' },
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'javascript', name: 'JavaScript', icon: '🟨' },
    { id: 'nodejs', name: 'Node.js', icon: '🟢' },
  ];

  const getCredentialCode = (language: Language) => {
    if (!application) {
      return '';
    }

    const credentials = {
      csharp: `// Application Configuration
public class DEEPAKX999AUTHConfig
{
    public const string API_KEY = "${application.apiKey}";
    public const string APP_ID = "${application.id}";
    public const string BASE_URL = "${baseUrl}";
    public const string CURRENT_VERSION = "${application.currentVersion || '1.0.0'}";
}

// Usage in your application
string apiKey = DEEPAKX999AUTHConfig.API_KEY;
string appId = DEEPAKX999AUTHConfig.APP_ID;
string endpoint = $"{DEEPAKX999AUTHConfig.BASE_URL}/api/user/login";`,

      python: `# Application Configuration
class DEEPAKX999AUTHConfig:
    API_KEY = "${application.apiKey}"
    APP_ID = "${application.id}"
    BASE_URL = "${baseUrl}"
    CURRENT_VERSION = "${application.currentVersion || '1.0.0'}"

# Usage in your application
api_key = DEEPAKX999AUTHConfig.API_KEY
app_id = DEEPAKX999AUTHConfig.APP_ID
endpoint = f"{DEEPAKX999AUTHConfig.BASE_URL}/api/user/login"`,

      java: `// Application Configuration
public class DEEPAKX999AUTHConfig {
    public static final String API_KEY = "${application.apiKey}";
    public static final String APP_ID = "${application.id}";
    public static final String BASE_URL = "${baseUrl}";
    public static final String CURRENT_VERSION = "${application.currentVersion || '1.0.0'}";
}

// Usage in your application
String apiKey = DEEPAKX999AUTHConfig.API_KEY;
String appId = DEEPAKX999AUTHConfig.APP_ID;
String endpoint = DEEPAKX999AUTHConfig.BASE_URL + "/api/user/login";`,

      javascript: `// Application Configuration
const DEEPAKX999AUTHConfig = {
    API_KEY: "${application.apiKey}",
    APP_ID: "${application.id}",
    BASE_URL: "${baseUrl}",
    CURRENT_VERSION: "${application.currentVersion || '1.0.0'}"
};

// Usage in your application
const apiKey = DEEPAKX999AUTHConfig.API_KEY;
const appId = DEEPAKX999AUTHConfig.APP_ID;
const endpoint = \`\${DEEPAKX999AUTHConfig.BASE_URL}/api/user/login\`;`,

      nodejs: `// Application Configuration (config.js)
module.exports = {
    API_KEY: "${application.apiKey}",
    APP_ID: "${application.id}",
    BASE_URL: "${baseUrl}",
    CURRENT_VERSION: "${application.currentVersion || '1.0.0'}"
};

// Usage in your application
const config = require('./config');
const apiKey = config.API_KEY;
const appId = config.APP_ID;
const endpoint = \`\${config.BASE_URL}/api/user/login\`;`,
    };

    return credentials[language];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading application...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="text-center p-12">
          <p className="text-slate-600 dark:text-slate-400">Application not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/dashboard/applications"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {application.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {application.description || 'Application credentials and license management'}
              </p>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollAnimateWrapper animation="scale">
            <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Licenses</div>
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white">{licenses.length}</div>
            </div>
          </ScrollAnimateWrapper>

          <ScrollAnimateWrapper animation="scale" delay={100}>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-green-700 dark:text-green-400">Active</div>
              </div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                {licenses.filter(l => l.status === 'active').length}
              </div>
            </div>
          </ScrollAnimateWrapper>

          <ScrollAnimateWrapper animation="scale" delay={200}>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-400">Version</div>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {application.currentVersion || '1.0.0'}
              </div>
            </div>
          </ScrollAnimateWrapper>
        </div>

        {/* Application Credentials */}
        <ScrollAnimateWrapper animation="fade">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Application Credentials</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Configure these credentials in your application
              </p>
            </div>

            {/* Language Tabs */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setActiveLanguage(lang.id as Language)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeLanguage === lang.id
                        ? 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg">{lang.icon}</span>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Display */}
            <div className="p-6">
              <div className="bg-slate-950 dark:bg-black rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-900 dark:bg-slate-950 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(getCredentialCode(activeLanguage))}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Code
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-sm text-slate-100 font-mono">
                    <code>{getCredentialCode(activeLanguage)}</code>
                  </pre>
                </div>
              </div>

              {/* Important Notes */}
              <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                <div className="flex gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-2">Security Best Practices</h3>
                    <ul className="space-y-1.5 text-sm text-amber-800 dark:text-amber-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>Never expose your API key in client-side code or public repositories</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>Use environment variables or secure configuration files for credentials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>Implement proper code obfuscation for production builds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                        <span>For full integration examples, visit the <Link href="/dashboard/docs" className="font-semibold underline hover:text-amber-700 dark:hover:text-amber-200">Documentation</Link></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Credential Details */}
        <ScrollAnimateWrapper animation="slide-right">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Credential Details</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* API Key */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg font-mono">
                    {showApiKey ? application.apiKey : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showApiKey ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => copyToClipboard(application.apiKey)}
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* App ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Application ID
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg font-mono">
                    {application.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(application.id)}
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Base URL
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-lg font-mono">
                    {baseUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(baseUrl)}
                    className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Licenses List */}
        <ScrollAnimateWrapper animation="fade">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">License Keys</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  All license keys for this application
                </p>
              </div>
              <Link
                href="/dashboard/licenses"
                className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                Manage Licenses
              </Link>
            </div>

            {licenses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No licenses yet</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Create license keys to start managing access to this application
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        License Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Devices
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Expires
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {licenses.map((license) => (
                      <tr key={license.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <code className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-md font-mono">
                            {license.key}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            license.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : license.status === 'expired'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                          }`}>
                            {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {license.devices.length} / {license.maxDevices}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(license.expiryDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollAnimateWrapper>
      </div>
    </DashboardLayout>
  );
}

