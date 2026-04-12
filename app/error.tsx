/**
 * Global Error Boundary
 * 
 * Catches unexpected errors and displays a friendly error page
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error);
  }, [error]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-8xl animate-spin-slow">⚠️</div>
            <div className="absolute top-0 left-0 text-8xl animate-ping opacity-25">💥</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 animate-fade-in">
          Oops! Something Went Wrong
        </h1>

        {/* Error message */}
        <div className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-6 mb-8 shadow-lg">
          <p className="text-lg text-slate-600 mb-2">
            We encountered an unexpected error. Don't worry, it's not your fault!
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg text-left">
              <p className="text-xs font-mono text-red-700 break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🔄 Try Again
          </button>
          <Link
            href="/"
            className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🏠 Go Home
          </Link>
        </div>

        {/* Additional help */}
        <p className="text-sm text-slate-500 mt-8">
          If this problem persists, please contact support with error code:{' '}
          <code className="px-2 py-1 bg-slate-100 rounded text-xs">
            {error.digest || 'UNKNOWN'}
          </code>
        </p>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

