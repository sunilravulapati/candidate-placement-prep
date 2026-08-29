// src/app/(dashboard)/error.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw, LayoutDashboard, Sparkles } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center relative overflow-hidden animate-fade-in">
      {/* Background Animated Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 max-w-lg w-full space-y-6">
        {/* Animated Error Badge */}
        <div className="relative inline-flex flex-col items-center">
          <div className="relative p-6 rounded-3xl bg-slate-900/80 border border-rose-500/30 shadow-2xl backdrop-blur-xl shadow-rose-950/40">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-amber-600 rounded-3xl blur-md opacity-30 animate-pulse" />
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Runtime Boundary Caught</span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Something went wrong
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            {error?.message || 'An unexpected error occurred while loading this workspace.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-sm font-bold shadow-xl shadow-rose-900/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
