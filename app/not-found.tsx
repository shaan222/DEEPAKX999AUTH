/**
 * Custom 404 Not Found Page
 * 
 * Features:
 * - Animated character
 * - Funny random dialogues
 * - Modern minimal design
 * - Smooth animations
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const funnyDialogues = [
  "Oops! This page went to get milk and never came back 🥛",
  "404: Page not found. But you found this cool error page! 🎉",
  "This page is on vacation. Please try another destination 🏖️",
  "Error 404: The page you're looking for is in another castle 🏰",
  "Looks like you took a wrong turn at Albuquerque 🌵",
  "This page is playing hide and seek. Spoiler: It's winning! 🙈",
  "Houston, we have a problem. This page doesn't exist 🚀",
  "The page you seek cannot be found. But you can find the way back 🧭",
  "Plot twist: This page never existed 🎬",
  "This page ghosted us harder than your ex 👻",
];

export default function NotFound() {
  const [dialogue, setDialogue] = useState('');
  const [mounted, setMounted] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animated 404 Character */}
        <div className="relative mb-8">
          {/* Main character - Confused robot */}
          <div className="relative inline-block animate-bounce-slow">
            <div className="text-9xl font-bold text-slate-900 relative">
              <span className="inline-block animate-wiggle">4</span>
              <span className="inline-block mx-4">
                {/* Robot face as 0 */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl inline-flex items-center justify-center transform rotate-12 animate-spin-slow shadow-2xl">
                    {/* Eyes */}
                    <div className="flex gap-3 mb-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-blink"></div>
                      <div className="w-3 h-3 bg-white rounded-full animate-blink-delay"></div>
                    </div>
                  </div>
                  {/* Antenna */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-6 bg-slate-700 mx-auto"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </span>
              <span className="inline-block animate-wiggle-delay">4</span>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 text-3xl animate-float">❓</div>
            <div className="absolute top-20 right-10 text-3xl animate-float-delay">🔍</div>
            <div className="absolute bottom-10 left-1/4 text-3xl animate-float-delay-2">📄</div>
            <div className="absolute bottom-20 right-1/4 text-3xl animate-float">💫</div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 animate-fade-in">
          Page Not Found
        </h1>

        {/* Funny dialogue */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8 shadow-lg animate-slide-up">
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            {dialogue}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay">
          <Link
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700"
          >
            🏠 Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:border-slate-400"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Additional info */}
        <p className="text-sm text-slate-500 mt-8 animate-fade-in-delay">
          Error Code: 404 | If you think this is a mistake, please contact support
        </p>
      </div>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes wiggle-delay {
          0%, 100% { transform: rotate(3deg); }
          50% { transform: rotate(-3deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delay {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-5deg); }
        }
        @keyframes float-delay-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }
        @keyframes blink-delay {
          0%, 92%, 100% { opacity: 1; }
          96% { opacity: 0; }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        .animate-wiggle-delay { animation: wiggle-delay 2s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 3.5s ease-in-out infinite; }
        .animate-float-delay-2 { animation: float-delay-2 4s ease-in-out infinite; }
        .animate-blink { animation: blink 3s ease-in-out infinite; }
        .animate-blink-delay { animation: blink-delay 3s ease-in-out infinite; }
        .animate-blob { animation: blob 7s ease-in-out infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-slide-up-delay {
          animation: slideUp 0.6s ease-out 0.4s forwards;
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

