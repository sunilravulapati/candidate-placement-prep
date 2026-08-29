// src/app/(dashboard)/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  Flame,
  Brain,
  Code2,
  Mic2,
  FileText,
  Building2,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Activity,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

interface DomainMetric {
  name: string;
  category: string;
  score: number;
  total: number;
  accuracy: number;
  status: 'Mastered' | 'On Track' | 'Needs Practice';
  color: string;
  href: string;
}

const DOMAIN_METRICS: DomainMetric[] = [
  {
    name: 'Data Structures & Algorithms',
    category: 'Technical Coding',
    score: 68,
    total: 100,
    accuracy: 72,
    status: 'On Track',
    color: 'from-amber-500 to-orange-500',
    href: '/dsa',
  },
  {
    name: 'Placement Aptitude',
    category: 'Quant, Verbal & Reasoning',
    score: 75,
    total: 100,
    accuracy: 67,
    status: 'On Track',
    color: 'from-fuchsia-500 to-pink-500',
    href: '/aptitude',
  },
  {
    name: 'Mock Interview Performance',
    category: 'AI Voice & Follow-ups',
    score: 82,
    total: 100,
    accuracy: 82,
    status: 'Mastered',
    color: 'from-violet-500 to-indigo-500',
    href: '/mock-interviews',
  },
  {
    name: 'Resume ATS & Alignment',
    category: 'Keywords & Formatting',
    score: 85,
    total: 100,
    accuracy: 85,
    status: 'Mastered',
    color: 'from-emerald-500 to-teal-500',
    href: '/resume-studio',
  },
  {
    name: 'CS Fundamentals & Design',
    category: 'OS, DBMS, Networks, OOPs',
    score: 70,
    total: 100,
    accuracy: 70,
    status: 'On Track',
    color: 'from-cyan-500 to-blue-500',
    href: '/knowledge-hub',
  },
];

const WEAK_SPOTS = [
  {
    topic: 'Graph Shortest Paths (Dijkstra, Bellman-Ford)',
    domain: 'DSA Studio',
    accuracy: '42%',
    recommendedAction: 'Practice 3 medium graph problems',
    href: '/dsa',
  },
  {
    topic: 'Permutations & Probability Calculations',
    domain: 'Aptitude Studio',
    accuracy: '50%',
    recommendedAction: 'Take 10-question timed practice set',
    href: '/aptitude',
  },
  {
    topic: 'Database Sharding & Consistent Hashing',
    domain: 'Knowledge Hub',
    accuracy: '58%',
    recommendedAction: 'Review System Design flashcards',
    href: '/knowledge-hub',
  },
];

const COMPANY_BENCHMARKS = [
  { company: 'Amazon', currentReadiness: 72, cutoff: 75, status: 'Near Target' },
  { company: 'Google', currentReadiness: 64, cutoff: 80, status: 'In Progress' },
  { company: 'Microsoft', currentReadiness: 70, cutoff: 72, status: 'Near Target' },
  { company: 'TCS Digital', currentReadiness: 88, cutoff: 65, status: 'Qualified' },
  { company: 'Infosys SP', currentReadiness: 84, cutoff: 70, status: 'Qualified' },
];

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  // Overall weighted score
  const overallReadiness = 78;

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 font-sans">
      {/* Header Banner */}
      <PageHeader
        title="Analytics & Readiness Command Center"
        description="Comprehensive placement telemetry, cross-domain performance curves, AI-identified weak spots, and target company cutoff benchmarks."
        icon={BarChart3}
        iconClassName="text-cyan-400"
        gradientFrom="from-cyan-950/70"
        gradientVia="via-indigo-950/45"
        gradientTo="to-slate-900/45"
        borderColor="border-cyan-500/20"
        glowColor="bg-cyan-500/15"
        secondaryGlowColor="bg-indigo-500/10"
        actions={
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl backdrop-blur-md">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All-Time' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  timeframe === t.id
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Top Level Readiness Gauge & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Placement Readiness Wheel */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden backdrop-blur-md shadow-xl">
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-cyan-400" /> Overall Placement Readiness
          </span>

          <div className="relative flex items-center justify-center my-2">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="#1e293b" strokeWidth="10" fill="transparent" />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="url(#cyanGrad)"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - overallReadiness / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-white">{overallReadiness}%</span>
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">High Tier</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +4.2% from last cycle
          </div>
        </div>

        {/* 4 Telemetry Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                DSA Studio
              </span>
            </div>
            <div className="space-y-1 mt-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Problems Solved</p>
              <h3 className="text-2xl font-black text-white">45 <span className="text-xs text-slate-500 font-normal">/ 350+ Curated</span></h3>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3 border border-slate-850">
              <div className="bg-amber-400 h-full rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-xl">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Aptitude
              </span>
            </div>
            <div className="space-y-1 mt-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Global Accuracy</p>
              <h3 className="text-2xl font-black text-emerald-400">67.4% <span className="text-xs text-slate-500 font-normal">Accuracy</span></h3>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3 border border-slate-850">
              <div className="bg-fuchsia-400 h-full rounded-full" style={{ width: '67.4%' }} />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                <Mic2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Mock Sessions
              </span>
            </div>
            <div className="space-y-1 mt-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Recruiter Rating</p>
              <h3 className="text-2xl font-black text-violet-400">8.2 <span className="text-xs text-slate-500 font-normal">/ 10 Score</span></h3>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3 border border-slate-850">
              <div className="bg-violet-400 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Streak Active
              </span>
            </div>
            <div className="space-y-1 mt-4">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Learning Streak</p>
              <h3 className="text-2xl font-black text-white">4 <span className="text-xs text-slate-500 font-normal">Consecutive Days</span></h3>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3 border border-slate-850">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Domain Readiness Matrix & Weak Spots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Domain Mastery Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-7 space-y-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Domain Readiness Matrix
              </h2>
              <span className="text-xs font-mono text-slate-500">5 Tracks Monitored</span>
            </div>

            <div className="space-y-5">
              {DOMAIN_METRICS.map((domain) => (
                <div key={domain.name} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{domain.name}</span>
                      <span className="text-slate-500 ml-2">({domain.category})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-cyan-300">{domain.score}%</span>
                      <Link
                        href={domain.href}
                        className="text-slate-400 hover:text-white transition-colors p-0.5"
                        title="Go to module"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950/80 h-2.5 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${domain.color} transition-all duration-700`}
                      style={{ width: `${domain.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI-Identified Weak Spots & Targeted Revision */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-7 space-y-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Recommended Focus Areas (Weak Spots)
              </h2>
              <span className="text-xs text-amber-400/80 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Action Required
              </span>
            </div>

            <div className="space-y-3">
              {WEAK_SPOTS.map((ws, i) => (
                <div
                  key={i}
                  className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <h4 className="text-xs font-bold text-slate-200">{ws.topic}</h4>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                        {ws.accuracy} accuracy
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{ws.recommendedAction}</p>
                  </div>

                  <Link
                    href={ws.href}
                    className="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center justify-center gap-1 transition-all shrink-0"
                  >
                    <span>Practice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Company Benchmarks & Mock Interview Dimension Breakdown */}
        <div className="space-y-6">
          {/* Target Company Benchmarks */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Company Cutoff Match
            </h2>

            <div className="space-y-3 pt-1">
              {COMPANY_BENCHMARKS.map((comp) => (
                <div
                  key={comp.company}
                  className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl space-y-2 shadow-inner text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{comp.company}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        comp.status === 'Qualified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : comp.status === 'Near Target'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Readiness: {comp.currentReadiness}%</span>
                    <span>Cutoff: {comp.cutoff}%</span>
                  </div>

                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.currentReadiness >= comp.cutoff ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${comp.currentReadiness}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/company-prep"
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1 transition-colors"
            >
              <span>Explore All Company Roadmaps</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mock Interview Evaluation Radar Breakdown */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-md shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-violet-400" />
              Interview Evaluation Breakdown
            </h2>

            <div className="space-y-3 text-xs">
              {[
                { dimension: 'Communication Clarity', score: 8.5 },
                { dimension: 'Problem Decomposition', score: 7.8 },
                { dimension: 'Technical Depth', score: 8.2 },
                { dimension: 'System Architecture', score: 7.0 },
                { dimension: 'Behavioral STAR Delivery', score: 8.8 },
              ].map((dim) => (
                <div key={dim.dimension} className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{dim.dimension}</span>
                    <span className="font-bold text-violet-300">{dim.score} / 10</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-850">
                    <div
                      className="bg-violet-400 h-full rounded-full"
                      style={{ width: `${(dim.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
