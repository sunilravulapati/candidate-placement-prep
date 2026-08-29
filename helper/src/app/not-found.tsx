// src/app/not-found.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Search,
} from 'lucide-react';

const QUICK_LINKS = [
  {
    label: 'DSA Studio',
    href: '/dsa',
    desc: 'Algorithms & topic roadmaps',
    icon: Code2,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
  },
  {
    label: 'Aptitude Studio',
    href: '/aptitude',
    desc: 'Quant, Logical & Verbal sets',
    icon: Brain,
    color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20 group-hover:border-fuchsia-500/40',
  },
  {
    label: 'Company Prep',
    href: '/company-prep',
    desc: 'Amazon, Google, TCS tracks',
    icon: Building2,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 group-hover:border-cyan-500/40',
  },
  {
    label: 'Mock Interviews',
    href: '/mock-interviews',
    desc: 'Live AI recruiter sessions',
    icon: Mic2,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 group-hover:border-violet-500/40',
  },
  {
    label: 'Resume Studio',
    href: '/resume-studio',
    desc: 'ATS scan & smart tailoring',
    icon: FileText,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
  },
];

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Animated Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Orbit Rings Decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[500px] h-[500px] rounded-full border border-violet-500/30 animate-[spin_40s_linear_infinite]" />
        <div className="absolute w-[350px] h-[350px] rounded-full border border-dashed border-indigo-500/20 animate-[spin_25s_linear_infinite_reverse]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 animate-fade-in">
        {/* Animated Floating 404 Badge */}
        <div className="relative inline-flex flex-col items-center">
          <div className="relative p-6 rounded-3xl bg-slate-900/80 border border-violet-500/30 shadow-2xl backdrop-blur-xl shadow-violet-950/40">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl blur-md opacity-30 animate-pulse" />
            <div className="relative flex items-center gap-3">
              <Compass className="w-12 h-12 text-violet-400 animate-[spin_10s_ease-in-out_infinite]" />
              <span className="text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-200 to-fuchsia-400">
                404
              </span>
            </div>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Route Does Not Exist</span>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Lost in Cyberspace?
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            The page or route you attempted to visit{' '}
            {pathname ? (
              <code className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-violet-300 font-mono text-xs font-semibold">
                {pathname}
              </code>
            ) : (
              'at this URL'
            )}{' '}
            could not be found or may have been moved.
          </p>
        </div>

        {/* Primary CTA Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-violet-900/30 flex items-center gap-2.5 transition-all duration-200 active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={() => router.back()}
            className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Helpful Direct Hub Navigation Links */}
        <div className="pt-6 border-t border-slate-800/80 space-y-4 text-left">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              Popular Destinations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/40 transition-all duration-200 flex items-center gap-3 shadow-sm backdrop-blur-md"
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 transition-colors ${link.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">
                      {link.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {link.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
