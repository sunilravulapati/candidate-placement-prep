// src/app/(dashboard)/not-found.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowLeft,
  LayoutDashboard,
  Code2,
  Brain,
  Building2,
  Mic2,
  FileText,
  Sparkles,
} from 'lucide-react';

export default function DashboardNotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center relative overflow-hidden animate-fade-in">
      {/* Background Animated Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full space-y-6">
        {/* Floating 404 Icon & Badge */}
        <div className="relative inline-flex flex-col items-center">
          <div className="relative p-6 rounded-3xl bg-slate-900/80 border border-violet-500/30 shadow-2xl backdrop-blur-xl shadow-violet-950/40">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur-md opacity-30 animate-pulse" />
            <div className="relative flex items-center gap-3">
              <Compass className="w-10 h-10 text-violet-400 animate-[spin_10s_ease-in-out_infinite]" />
              <span className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-200 to-fuchsia-400">
                404
              </span>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Page Does Not Exist</span>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Route Not Found
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            The studio page or subroute you requested does not exist or may have been updated.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-violet-900/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>

          <button
            onClick={() => router.back()}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
