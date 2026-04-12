/**
 * Custom Unauthorized (401/403) Page
 * 
 * Features:
 * - Animated security guard character
 * - Funny dialogues with attitude
 * - Modern minimal design
 * - Smooth animations
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const funnyDialogues = [
  "Don't act oversmart bro 😎",
  "Nice try, but you're not getting in here buddy 🚫",
  "Access Denied! You shall not pass! 🧙‍♂️",
  "Whoa there! This area is VIP only 👑",
  "Stop right there, criminal scum! Nobody breaks the law on my watch 👮",
  "Error 403: Your hacking skills need an upgrade 💻",
  "Trying to sneak in? The security cameras saw everything 📹",
  "Unauthorized! This isn't a free trial area 🎫",
  "Authentication failed. Better luck next time, hacker wannabe 🕵️",
  "You don't have permission for this. Go back before I call your mom 📞",
  "Access Denied! This is more secure than Area 51 👽",
  "Nope! You're not authorized. Get outta here 🏃‍♂️",
];

export default function Unauthorized() {
  const [dialogue, setDialogue] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Pick random dialogue
    const randomDialogue = funnyDialogues[Math.floor(Math.random() * funnyDialogues.length)];
    setDialogue(randomDialogue);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated Security Guard Character */}
        <div className="relative mb-8">
          {/* Security Guard Icon */}
          <div className="relative inline-block">
            <div className="text-8xl animate-bounce-gentle">
              {/* Shield */}
              <div className="relative inline-block">
                <svg
                  className="w-32 h-32 mx-auto animate-pulse-slow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"
                    className="fill-red-500 stroke-red-700"
                  />
                  {/* X mark */}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9l6 6m0-6l-6 6"
                    className="stroke-white animate-scale-in"
                  />
                </svg>
                
                {/* Animated eyes watching you */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                      <div className="w-8 h-8 bg-white border-2 border-red-600 rounded-full"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-red-600 rounded-full animate-look-around"></div>
                    </div>
                    <div className="relative">
                      <div className="w-8 h-8 bg-white border-2 border-red-600 rounded-full"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-red-600 rounded-full animate-look-around"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning signs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 text-4xl animate-warning-blink">⚠️</div>
              <div className="absolute top-0 right-0 text-4xl animate-warning-blink-delay">🚨</div>
              <div className="absolute bottom-0 left-10 text-4xl animate-warning-blink-delay-2">🔒</div>
              <div className="absolute bottom-0 right-10 text-4xl animate-warning-blink">⛔</div>
            </div>
          </div>
        </div>

        {/* Error code */}
        <div className="mb-4">
          <span className="inline-block px-4 py-2 bg-red-100 text-red-700 font-mono font-bold text-sm rounded-full border-2 border-red-300 animate-fade-in">
            ERROR 403 | UNAUTHORIZED ACCESS
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 animate-shake">
          Access Denied!
        </h1>

        {/* Funny dialogue */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg animate-slide-up relative overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-repeat" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0px, #ef4444 10px, transparent 10px, transparent 20px)',
            }}></div>
          </div>
          
          <p className="text-lg md:text-xl text-red-700 font-semibold leading-relaxed relative z-10">
            {dialogue}
          </p>
        </div>

        {/* Additional message */}
        <p className="text-slate-600 mb-8 animate-fade-in-delay">
          You don't have permission to access this page. <br />
          Please log in with proper credentials or contact an administrator.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay">
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-slate-700 hover:to-slate-800"
          >
            ← Go Back
          </button>
          <Link
            href="/"
            className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:border-slate-400"
          >
            🏠 Home
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
          >
            🔐 Login
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-12 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200 animate-fade-in-delay">
          <p className="text-xs text-slate-500 mb-2">💡 Common causes:</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• You're not logged in</li>
            <li>• Your session has expired</li>
            <li>• You don't have the required permissions</li>
            <li>• You're trying to access someone else's resources</li>
          </ul>
        </div>
      </div>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        @keyframes scale-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes look-around {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(8px, 0); }
          50% { transform: translate(8px, 8px); }
          75% { transform: translate(0, 8px); }
        }
        @keyframes warning-blink {
          0%, 50%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.3; transform: scale(0.9); }
          75% { opacity: 0.3; transform: scale(0.9); }
        }
        @keyframes warning-blink-delay {
          0%, 50%, 100% { opacity: 0.3; transform: scale(0.9); }
          25% { opacity: 1; transform: scale(1); }
          75% { opacity: 1; transform: scale(1); }
        }
        @keyframes warning-blink-delay-2 {
          0%, 25%, 75%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.9); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .animate-scale-in { animation: scale-in 0.5s ease-out; }
        .animate-look-around { animation: look-around 4s ease-in-out infinite; }
        .animate-warning-blink { animation: warning-blink 2s ease-in-out infinite; }
        .animate-warning-blink-delay { animation: warning-blink-delay 2s ease-in-out infinite; }
        .animate-warning-blink-delay-2 { animation: warning-blink-delay-2 2s ease-in-out infinite; }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-blob { animation: blob 7s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }
        .animate-slide-up-delay {
          animation: slideUp 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

