// helper/src/components/aptitude/Dashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Target, BookA, Calculator, Trophy, ChevronRight, Flame, BarChart3, AlertCircle } from 'lucide-react';
import { ProgressCard } from '../ui/ProgressCard';
import { ActivityHeatmap } from '../ui/ActivityHeatmap';
import { MetricGrid } from '../ui/MetricGrid';
import { MetricCard } from '../ui/metric-card';
import { ErrorCard } from '../ui/error-card';
import { getAptitudeDashboardStatsAction } from '@backend/features/aptitude/actions';

export default function Dashboard({ onNavigate }: { onNavigate?: (tab: string) => void }) {
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
        console.error('Failed to load dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard stats. Restart your dev server if database changes are not picked up.');
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
          message="Next.js cannot read the newly created Database columns because of cache. Please CLEAR Next.js cache and RESTART the dev server (Ctrl+C, then npm run dev) to load client models successfully." 
          onRetry={() => {
            window.location.reload();
          }} 
        />
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-900/40 border border-slate-800" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-3xl bg-slate-900/40 border border-slate-800" />
          <div className="h-72 rounded-3xl bg-slate-900/40 border border-slate-800" />
        </div>
      </div>
    );
  }


  // Categories progress item builder
  const getCategoryProgressVal = (category: string) => {
    const items = stats?.topicProgress?.filter((tp: any) => tp.category === category) || [];
    const solved = items.reduce((acc: number, curr: any) => acc + curr.solved, 0);
    const total = items.reduce((acc: number, curr: any) => acc + curr.total, 0);
    return { solved, total };
  };

  const quant = getCategoryProgressVal('quantitative');
  const logical = getCategoryProgressVal('logical');
  const verbal = getCategoryProgressVal('verbal');
  const di = getCategoryProgressVal('di');

  const progressItems = [
    { label: 'Quantitative', value: quant.solved, total: quant.total || 1, color: 'bg-blue-400' },
    { label: 'Logical Reasoning', value: logical.solved, total: logical.total || 1, color: 'bg-rose-450' },
    { label: 'Verbal Ability', value: verbal.solved, total: verbal.total || 1, color: 'bg-emerald-400' },
    { label: 'Data Interpretation', value: di.solved, total: di.total || 1, color: 'bg-amber-450' },
  ];

  // Helper formatting for timing
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <MetricGrid columns={4}>
        <MetricCard 
          label="Total Solved" 
          value={stats.solvedCount} 
          icon={Calculator} 
          iconColor="text-blue-400" 
          iconBg="bg-blue-500/10 border-blue-500/20" 
        />
        <MetricCard 
          label="Overall Accuracy" 
          value={`${stats.accuracy}%`} 
          icon={Trophy} 
          iconColor="text-emerald-400" 
          iconBg="bg-emerald-500/10 border-emerald-500/20" 
        />
        <MetricCard 
          label="Average Time per Q" 
          value={formatTime(stats.avgTimePerQuestion)} 
          icon={Target} 
          iconColor="text-amber-400" 
          iconBg="bg-amber-500/10 border-amber-500/20" 
        />
        <MetricCard 
          label="Daily Streak" 
          value={`${stats.streak} Days`} 
          icon={Flame} 
          iconColor="text-fuchsia-400" 
          iconBg="bg-fuchsia-500/10 border-fuchsia-500/20" 
          badge={stats.streak > 0 ? "Active" : undefined}
          badgeColor="text-fuchsia-400 bg-fuchsia-500/10"
        />
      </MetricGrid>

      {/* Main Grid split: charts/recommended and progress ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Start Module */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 to-violet-600/20 opacity-50 group-hover:opacity-100 transition-all duration-500" />
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-4 inline-block">
                  Practice Mode
                </span>
                <h3 className="text-xl font-bold text-white mb-2">Crack Placements with Custom Practice</h3>
                <p className="text-slate-400 text-xs mb-4 max-w-md">Create custom practice sets in either test mode or revision practice mode to improve performance speed.</p>
                <button
                  onClick={() => onNavigate?.('practice')}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-xs"
                >
                  Configure Custom Set <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * stats.accuracy) / 100} className="text-fuchsia-500" strokeLinecap="round" />
                </svg>
                <span className="absolute text-sm font-bold text-white">{stats.accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap heatmap={stats.weeklyActivity} loading={false} />
        </div>

        {/* Right Column: Skill Progress and Weak/Strong Topics */}
        <div className="space-y-6">
          {/* Skill Progress */}
          <ProgressCard
            title="Skill Progress"
            ringProgress={stats.solvedCount > 0 ? Math.round((stats.solvedCount / (quant.total + logical.total + verbal.total + di.total)) * 100) : 0}
            ringLabel={`${stats.solvedCount}`}
            ringSublabel="Questions Solved"
            ringColor="text-fuchsia-500"
            items={progressItems}
          />

          {/* Weak/Strong Topics Panel */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Topic Insights
            </h3>

            <div className="space-y-3">
              {/* Strongest */}
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Strongest Topics</p>
                {stats.strongTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {stats.strongTopics.map((top: string) => (
                      <span key={top} className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-lg">
                        {top}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-600 italic">Attempt more questions to identify strong topics.</p>
                )}
              </div>

              {/* Weakest */}
              <div className="pt-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">Weakest Topics</p>
                {stats.weakTopics.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {stats.weakTopics.map((top: string) => (
                      <span key={top} className="text-[10px] font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-450 px-2.5 py-0.5 rounded-lg">
                        {top}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-600 italic">No weak topics found yet. Keep up the high accuracy!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
