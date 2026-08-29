// src/app/global-error.tsx
'use client';

import React from 'react';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b14] text-slate-100 min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
          <div className="relative inline-flex p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Application Error</h2>
            <p className="text-sm text-slate-400">
              {error?.message || 'A critical error occurred while rendering the interface.'}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-sm flex items-center gap-2 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
