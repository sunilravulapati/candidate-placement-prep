'use client';

import React, { useState, useEffect } from 'react';
import { getDashboardDataAction } from '@backend/features/liveCoding/actions';
import { motion } from 'framer-motion';
import {
  Play,
  Code2,
  Target,
  BookOpen,
  History,
  TrendingUp,
  ChevronRight,
  Flame,
  CheckCircle2,
  Calendar,
  Award,
  Bookmark,
  BarChart3,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { DashboardData } from '@backend/features/liveCoding/types';
import { PageHeader } from '../ui/PageHeader';
import { ActivityHeatmap } from '../ui/ActivityHeatmap';
import { ProgressCard } from '../ui/ProgressCard';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ── Components ─────────────────────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────────────────────
export default function DSAStudioDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setIsClient(true);
    getDashboardDataAction()
      .then(setData)
      .catch(() => setLoadError(true));
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <Code2 className="w-8 h-8 text-rose-400" />
          <span className="text-slate-400 font-medium">Failed to load DSA dashboard</span>
          <button
            onClick={() => { setLoadError(false); getDashboardDataAction().then(setData).catch(() => setLoadError(true)); }}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Code2 className="w-8 h-8 text-indigo-400 animate-pulse" />
          <span className="text-slate-400 font-medium">Loading DSA Studio…</span>
        </div>
      </div>
    );
  }

  const { stats, todaysChallenge, continueSession, recentAttempts, learningPaths, companyProgress, topicProgress, heatmap } = data;
  const totalSolved = stats.easy.solved + stats.medium.solved + stats.hard.solved;
  const totalQuestions = stats.easy.total + stats.medium.total + stats.hard.total;
  const percentComplete = totalQuestions > 0 ? Math.round((totalSolved / totalQuestions) * 100) : 0;

  return (
    <>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <PageHeader
            title="Welcome back, Developer!"
            description="Continue your interview preparation with curated paths and real-world company problems."
            badge={
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                <Code2 className="w-4 h-4" /> DSA Studio
              </div>
            }
            actions={
              <Link
                href="/dsa/library"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4" /> Problem Library
              </Link>
            }
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* ── Left column (col-span-3) ─────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-8">

            {/* Action cards row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Today's challenge */}
              <motion.div variants={item} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-3xl blur-xl opacity-50 group-hover:blur-2xl transition-all duration-500" />
                <div className="relative h-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-400 border border-amber-500/20">
                      Today&apos;s Challenge
                    </span>
                  </div>
                  {todaysChallenge ? (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">{todaysChallenge.title}</h3>
                      <p className="text-slate-400 text-sm mb-5 flex-grow">
                        <span className={cn(
                          'font-semibold',
                          todaysChallenge.difficulty === 'EASY' ? 'text-emerald-400'
                          : todaysChallenge.difficulty === 'MEDIUM' ? 'text-amber-400'
                          : 'text-rose-400'
                        )}>
                          {todaysChallenge.difficulty.charAt(0) + todaysChallenge.difficulty.slice(1).toLowerCase()}
                        </span>
                        {todaysChallenge.topics.length > 0 && ` • ${todaysChallenge.topics[0]}`}
                        {todaysChallenge.companies.length > 0 && ` • ${todaysChallenge.companies[0]}`}
                      </p>
                      <Link
                        href={`/dsa/workspace/${todaysChallenge.slug}`}
                        className="w-full py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all text-sm"
                      >
                        Start Challenge <Play className="w-4 h-4" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">All caught up!</h3>
                      <p className="text-slate-400 text-sm mb-5 flex-grow">You&apos;ve solved all available problems. More coming soon.</p>
                      <Link href="/dsa/library" className="w-full py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all text-sm">
                        Browse Library <BookOpen className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Continue session */}
              <motion.div variants={item} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-50 group-hover:blur-2xl transition-all duration-500" />
                <div className="relative h-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <History className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
                      {continueSession ? 'In Progress' : 'No Session'}
                    </span>
                  </div>
                  {continueSession ? (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">{continueSession.title}</h3>
                      <p className="text-slate-400 text-sm mb-5 flex-grow">
                        Last active {continueSession.lastActive} • {continueSession.language}
                      </p>
                      <Link
                        href={`/dsa/workspace/${continueSession.slug}`}
                        className="w-full py-2.5 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-sm"
                      >
                        Resume Session <ChevronRight className="w-4 h-4" />
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold text-white mb-2">Start a Session</h3>
                      <p className="text-slate-400 text-sm mb-5 flex-grow">Pick any problem and start solving to track your progress here.</p>
                      <Link href="/dsa/library" className="w-full py-2.5 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-sm">
                        Browse Problems <ChevronRight className="w-4 h-4" />
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Learning Paths */}
            {learningPaths.length > 0 && (
              <motion.div variants={item} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" /> Learning Paths
                  </h2>
                  <Link href="/dsa/learning-paths" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {learningPaths.slice(0, 3).map((path) => {
                    const pct = path.total > 0 ? Math.round((path.solved / path.total) * 100) : 0;
                    return (
                      <Link key={path.slug} href={`/dsa/learning-paths`} className="p-4 rounded-2xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800 hover:border-indigo-500/30 transition-all cursor-pointer group">
                        <div className="font-bold text-white mb-1 text-sm group-hover:text-indigo-300 transition-colors">{path.title}</div>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>{path.solved}/{path.total} solved</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Activity Heatmap */}
            <motion.div variants={item}>
              <ActivityHeatmap heatmap={heatmap || []} loading={!isClient} />
            </motion.div>

            {/* Company & Topic Progress row */}
            {(companyProgress.length > 0 || topicProgress.length > 0) && (
              <div className="grid md:grid-cols-2 gap-6">
                {companyProgress.length > 0 && (
                  <motion.div variants={item} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                      <Building2 className="w-4 h-4 text-indigo-400" /> Company Progress
                    </h2>
                    <div className="space-y-3">
                      {companyProgress.slice(0, 5).map((c) => {
                        const pct = c.total > 0 ? Math.round((c.solved / c.total) * 100) : 0;
                        return (
                          <div key={c.slug}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300 font-medium">{c.name}</span>
                              <span className="text-slate-500">{c.solved}/{c.total}</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                {topicProgress.length > 0 && (
                  <motion.div variants={item} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                      <BarChart3 className="w-4 h-4 text-indigo-400" /> Topic Progress
                    </h2>
                    <div className="space-y-3">
                      {topicProgress.slice(0, 5).map((t) => {
                        const pct = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;
                        return (
                          <div key={t.slug}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300 font-medium">{t.name}</span>
                              <span className="text-slate-500">{t.solved}/{t.total}</span>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* ── Right column (col-span-1) ─────────────────────────────────── */}
          <div className="space-y-6">
            {/* Quick stats */}
            <motion.div variants={item} className="grid grid-cols-2 gap-3">
              {[
                { icon: <Flame className="w-5 h-5 text-orange-400" />, value: stats.currentStreak, label: 'Day Streak' },
                { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, value: stats.solvedToday, label: 'Solved Today' },
                { icon: <TrendingUp className="w-5 h-5 text-indigo-400" />, value: `${stats.acceptanceRate.toFixed(1)}%`, label: 'Acceptance' },
                { icon: <Award className="w-5 h-5 text-amber-400" />, value: stats.longestStreak, label: 'Max Streak' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                  {s.icon}
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Difficulty progress */}
            <motion.div variants={item}>
              <ProgressCard
                title="Difficulty Progress"
                ringProgress={percentComplete}
                ringLabel={`${percentComplete}%`}
                ringSublabel="complete"
                items={[
                  { label: 'Easy', value: stats.easy.solved, total: stats.easy.total, color: 'bg-emerald-400' },
                  { label: 'Medium', value: stats.medium.solved, total: stats.medium.total, color: 'bg-amber-400' },
                  { label: 'Hard', value: stats.hard.solved, total: stats.hard.total, color: 'bg-rose-400' },
                ]}
              />
            </motion.div>

            {/* Recent submissions */}
            {recentAttempts.length > 0 && (
              <motion.div variants={item} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Recent Submissions</h2>
                <div className="space-y-2">
                  {recentAttempts.slice(0, 5).map((attempt) => (
                    <Link
                      key={attempt.id}
                      href={`/dsa/workspace/${attempt.slug}`}
                      className="block p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-700 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-semibold text-xs text-slate-200 truncate">{attempt.title}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0">{attempt.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            attempt.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                          )}
                        >
                          {attempt.status}
                        </span>
                        <span className="text-[10px] text-slate-600 uppercase">{attempt.language}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Bookmarks (if available) */}
            {data.bookmarks && data.bookmarks.length > 0 && (
              <motion.div variants={item} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-400" /> Bookmarks
                </h2>
                <div className="space-y-2">
                  {data.bookmarks.slice(0, 4).map((b) => (
                    <Link key={b.slug} href={`/dsa/workspace/${b.slug}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-800 transition-colors group">
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">{b.title}</span>
                      <span className={cn(
                        'text-[10px] font-bold uppercase shrink-0 ml-2',
                        b.difficulty === 'EASY' ? 'text-emerald-400' : b.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                      )}>{b.difficulty}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
    </>
  );
}
