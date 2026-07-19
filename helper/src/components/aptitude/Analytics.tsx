// helper/src/components/aptitude/Analytics.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, HelpCircle, Target, Award, ShieldAlert, Sparkles } from 'lucide-react';
import { getAptitudeDashboardStatsAction } from '@backend/features/aptitude/actions';
import { cn } from '@/lib/cn';
import { ErrorCard } from '../ui/error-card';

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAptitudeDashboardStatsAction();
        setStats(data);
      } catch (err: any) {
        console.error('Failed to load analytics stats:', err);
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (error) {
    return (
      <div className="pt-4 max-w-lg mx-auto">
        <ErrorCard 
          type="database" 
          message="Failed to load analytics data. Restart your Next.js dev server if you just completed database migrations." 
          onRetry={() => {
            window.location.reload();
          }} 
        />
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6 pt-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 rounded-3xl bg-slate-900/40 border border-slate-800" />
          <div className="h-44 rounded-3xl bg-slate-900/40 border border-slate-800" />
          <div className="h-44 rounded-3xl bg-slate-900/40 border border-slate-800" />
        </div>
        <div className="h-80 rounded-3xl bg-slate-900/40 border border-slate-800" />
      </div>
    );
  }

  const hasData = stats && stats.solvedCount > 0;

  if (!hasData) {
    return (
      <div className="pt-4 max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">No Analytics Data Yet</h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Complete practice topics or attempt mock custom sessions first. Your detailed performance charts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Questions Attempted and Completed */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Practice Volume</h4>
            <h3 className="text-3xl font-bold text-white">{stats.solvedCount}</h3>
            <p className="text-[10px] text-slate-500 mt-1">Questions mastered across the system.</p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-900">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Total Practice Sessions:</span>
              <span className="font-bold text-white">{stats.totalSessions}</span>
            </div>
          </div>
        </div>

        {/* Global Accuracy Rate */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Accuracy Standard</h4>
            <h3 className="text-3xl font-bold text-emerald-400">{stats.accuracy}%</h3>
            <p className="text-[10px] text-slate-500 mt-1">Correct answer ratio in custom practice drives.</p>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-900">
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Performance Grade:</span>
              <span className={cn(
                'font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-full border',
                stats.accuracy >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                stats.accuracy >= 60 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                'text-rose-450 bg-rose-500/10 border-rose-500/20'
              )}>
                {stats.accuracy >= 80 ? 'Distinction' : stats.accuracy >= 60 ? 'Good' : 'Needs Practice'}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty Solver breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-900">Difficulty Solved</h4>
          <div className="space-y-2">
            {/* Easy */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-emerald-400 font-bold">Easy</span>
                <span className="text-slate-400">{stats.difficultyDistribution.EASY} Solved</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-emerald-400" style={{ width: `${stats.solvedCount > 0 ? (stats.difficultyDistribution.EASY / stats.solvedCount) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Medium */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-amber-400 font-bold">Medium</span>
                <span className="text-slate-400">{stats.difficultyDistribution.MEDIUM} Solved</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-amber-400" style={{ width: `${stats.solvedCount > 0 ? (stats.difficultyDistribution.MEDIUM / stats.solvedCount) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Hard */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className="text-rose-400 font-bold">Hard</span>
                <span className="text-slate-400">{stats.difficultyDistribution.HARD} Solved</span>
              </div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div className="h-full bg-rose-400" style={{ width: `${stats.solvedCount > 0 ? (stats.difficultyDistribution.HARD / stats.solvedCount) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Performance Grid Matrix */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200">Granular Topic Matrix</h3>
          <p className="text-slate-400 text-xs mt-0.5">Summary of question volumes, solves, and accuracy breakdowns by subtopic.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4 font-bold">Topic</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold text-center">Solved Volume</th>
                <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                <th className="py-3 px-4 font-bold">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {stats.topicProgress.map((tp: any) => {
                const completionPct = Math.round((tp.solved / tp.total) * 100);
                return (
                  <tr key={tp.topic} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-200 capitalize">{tp.name || tp.topic.replace('-', ' ')}</td>
                    <td className="py-3 px-4 text-slate-450 capitalize font-medium">{tp.category}</td>
                    <td className="py-3 px-4 text-center text-slate-300 font-semibold">{tp.solved} / {tp.total}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded-lg border font-bold text-[10px]',
                        tp.accuracy >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tp.accuracy >= 60 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        tp.accuracy > 0 ? 'bg-rose-500/10 text-rose-450 border-rose-500/20' :
                        'bg-slate-900 text-slate-500 border-slate-850'
                      )}>
                        {tp.accuracy > 0 ? `${tp.accuracy}%` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-[150px]">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                          <div className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500" style={{ width: `${completionPct}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">{completionPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
