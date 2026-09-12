import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { LEARNING_PATHS } from '@backend/features/dsa/learningPathTaxonomy';
import { ArrowRight, Flame, Compass, ChevronRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Structured Learning Paths — DSA Studio | PrepGenie',
  description:
    'Targeted DSA roadmaps curated for placement season, Big Tech interviews, Online Assessments, and foundational mastery.',
};

export default function LearningPathsPage() {
  return (
    <div className="space-y-8 animate-fade-in text-slate-100 font-sans max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      {/* Subnavigation */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 text-xs font-mono overflow-x-auto scrollbar-none">
        <Link href="/dsa" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
          Overview
        </Link>
        <Link href="/dsa/learning-paths" className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold border border-slate-700">
          Learning Paths
        </Link>
        <Link href="/dsa#topics" className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors">
          Topics
        </Link>
        <Link href="/dsa/oa-essentials" className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1.5 font-bold shadow-sm shadow-amber-950/20">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>OA Essentials</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">70</span>
        </Link>
      </div>

      {/* Header */}
      <header className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wide">
          <Compass className="w-3.5 h-3.5" />
          <span>CURATED STUDY ROADMAPS</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-white">
          Structured Learning Paths
        </h1>
        <p className="text-slate-400 max-w-3xl text-sm md:text-base leading-relaxed">
          Choose a targeted preparation path based on your timeline, experience level, and upcoming hiring targets.
        </p>
      </header>

      {/* Featured Banner: OA Essentials */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900/90 to-slate-900/90 p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-amber-950/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-bold text-[10px] uppercase">
                Highest Yield
              </span>
              <span className="font-mono text-xs text-amber-300 font-bold">14-Day Sprint</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-white">
              OA Essentials (70 Ranked Problems)
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Curated pattern bank for Amazon, Uber, Goldman Sachs &amp; Google Online Assessments. Features 15-second diagnostic triggers, mental traps, and signature templates.
            </p>
          </div>

          <Link
            href="/dsa/oa-essentials"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs transition-all shrink-0 shadow-lg shadow-amber-950/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Flame className="w-4 h-4 text-slate-950" />
            <span>Launch OA Essentials Track</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid of All Learning Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEARNING_PATHS.map((path) => {
          const isOA = path.slug === 'oa-essentials';
          const targetHref = isOA ? '/dsa/oa-essentials' : `/dsa/learning-paths#${path.slug}`;

          return (
            <Link
              key={path.slug}
              href={targetHref}
              className={`group rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm backdrop-blur-md ${
                isOA
                  ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-400 hover:bg-amber-500/10 shadow-amber-950/20'
                  : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-mono font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                    {path.title}
                  </h3>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                    {path.recommendedDays}d
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {path.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 text-[11px] line-clamp-1">{path.targetAudience}</span>
                <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0 ml-2">
                  <span>{isOA ? 'Explore' : 'View Track'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
