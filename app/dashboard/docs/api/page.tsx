/**
 * API Reference Page - Redesigned
 * Clean, minimal, and user-friendly with dark mode
 */

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ScrollAnimateWrapper from '@/components/ScrollAnimateWrapper';
import toast from 'react-hot-toast';

export default function APIReferencePage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>('login');

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const endpoints = [
    {
      id: 'login',
      method: 'POST',
      path: '/api/user/login',
      description: 'Authenticate a user and retrieve their information',
      requestBody: [
        { name: 'apiKey', type: 'string', required: true, description: 'Your API key' },
        { name: 'username', type: 'string', required: true, description: 'Username' },
        { name: 'password', type: 'string', required: true, description: 'Password' },
        { name: 'hwid', type: 'string', required: false, description: 'Hardware ID (auto-generated if not provided)' },
      ],
      example: `fetch('https://www.DEEPAKX999AUTH.space/api/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'your-api-key',
    username: 'user123',
    password: 'password123',
    hwid: 'generated-hwid'
  })
}).then(res => res.json()).then(data => console.log(data));`,
    },
    {
      id: 'validate',
      method: 'POST',
      path: '/api/auth/validate',
      description: 'Validate a license key and bind to hardware',
      requestBody: [
        { name: 'apiKey', type: 'string', required: true, description: 'Your API key' },
        { name: 'licenseKey', type: 'string', required: true, description: 'License key' },
        { name: 'hwid', type: 'string', required: true, description: 'Hardware ID' },
      ],
      example: `fetch('https://www.DEEPAKX999AUTH.space/api/auth/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'your-api-key',
    licenseKey: 'LICENSE-KEY',
    hwid: 'generated-hwid'
  })
}).then(res => res.json()).then(data => console.log(data));`,
    },
    {
      id: 'reset-hwid',
      method: 'POST',
      path: '/api/user/reset-hwid',
      description: 'Reset a user\'s hardware ID lock (Admin only)',
      requestBody: [
        { name: 'apiKey', type: 'string', required: true, description: 'Your API key' },
        { name: 'userDocId', type: 'string', required: true, description: 'User document ID' },
        { name: 'appId', type: 'string', required: true, description: 'Application ID' },
      ],
      example: `fetch('https://www.DEEPAKX999AUTH.space/api/user/reset-hwid', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: JSON.stringify({
    userDocId: 'user-doc-id',
    appId: 'app-id'
  })
}).then(res => res.json()).then(data => console.log(data));`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <ScrollAnimateWrapper animation="fade">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              API Reference 📡
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Complete documentation for all API endpoints
            </p>
          </div>
        </ScrollAnimateWrapper>

        {/* Base URL */}
        <ScrollAnimateWrapper animation="scale">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3 uppercase tracking-wide">Base URL</h2>
                <code className="text-sm text-blue-800 dark:text-blue-300 bg-white dark:bg-blue-950 px-4 py-2 rounded-lg border border-blue-300 dark:border-blue-700 font-mono inline-block">
                  https://www.DEEPAKX999AUTH.space/api
                </code>
              </div>
              <div className="text-left md:text-right">
                <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 uppercase tracking-wide">Authentication</h2>
                <p className="text-xs text-blue-700 dark:text-blue-300">All requests require an API key</p>
              </div>
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Endpoints */}
        <ScrollAnimateWrapper animation="fade" delay={100}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Endpoints</h2>
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all">
                {/* Endpoint Header */}
                <button
                  onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold flex-shrink-0">
                      {endpoint.method}
                    </span>
                    <code className="text-sm font-mono text-slate-700 dark:text-slate-300 truncate">{endpoint.path}</code>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform flex-shrink-0 ml-2 ${
                      expandedEndpoint === endpoint.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Endpoint Details */}
                {expandedEndpoint === endpoint.id && (
                  <div className="px-5 pb-5 border-t border-slate-200 dark:border-slate-700 animate-fadeIn">
                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 mt-4">{endpoint.description}</p>

                    {/* Request Parameters */}
                    <div className="mb-6">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">Request Body</h3>
                      <div className="space-y-2">
                        {endpoint.requestBody.map((param) => (
                          <div key={param.name} className="flex flex-wrap items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <code className="text-sm font-mono text-blue-600 dark:text-blue-400 font-semibold">{param.name}</code>
                            <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                              {param.type}
                            </span>
                            {param.required && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-semibold">required</span>
                            )}
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-full mt-1">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Example Code</h3>
                        <button
                          onClick={() => copyCode(endpoint.example)}
                          className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                      </div>
                      <div className="bg-slate-950 dark:bg-black rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-slate-100 font-mono">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollAnimateWrapper>

        {/* Status Codes */}
        <ScrollAnimateWrapper animation="slide-right" delay={200}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">HTTP Status Codes</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <StatusCode code="200" name="OK" description="Request successful" color="green" />
              <StatusCode code="400" name="Bad Request" description="Invalid parameters" color="yellow" />
              <StatusCode code="401" name="Unauthorized" description="Invalid API key" color="red" />
              <StatusCode code="403" name="Forbidden" description="Access denied" color="red" />
              <StatusCode code="429" name="Rate Limited" description="Too many requests" color="orange" />
              <StatusCode code="500" name="Server Error" description="Internal server error" color="red" />
            </div>
          </div>
        </ScrollAnimateWrapper>

        {/* Response Format */}
        <ScrollAnimateWrapper animation="scale" delay={300}>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Response Format</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              All API responses follow a consistent JSON format:
            </p>
            <div className="bg-slate-950 dark:bg-black rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-100 font-mono">
                <code>{`{
  "success": true,
  "message": "Operation successful",
  "data": { /* Response data here */ }
}`}</code>
              </pre>
            </div>
          </div>
        </ScrollAnimateWrapper>
      </div>
    </DashboardLayout>
  );
}

function StatusCode({ code, name, description, color }: { code: string; name: string; description: string; color: string }) {
  const colors = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
      <span className={`px-3 py-1 ${colors[color as keyof typeof colors]} border rounded-lg text-xs font-bold flex-shrink-0`}>
        {code}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{name}</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}
