// helper/src/components/aptitude/History.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, Award, Target, HelpCircle, Sliders, ListFilter } from 'lucide-react';
import { getAptitudeHistoryAction } from '@backend/features/aptitude/actions';
import { cn } from '@/lib/cn';
import { ErrorCard } from '../ui/error-card';

interface HistoryProps {
  onReviewSession: (session: any) => void;
}

export default function History({ onReviewSession }: HistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAptitudeHistoryAction();
        setHistory(data);
      } catch (err: any) {
        console.error('Failed to load history logs:', err);
        setError(err.message || 'Failed to load history logs.');
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (error) {
    return (
      <div className="pt-4 max-w-lg mx-auto">
        <ErrorCard 
          type="database" 
          message="Failed to load history logs. Restart your Next.js dev server if you just completed database migrations." 
          onRetry={() => {
            window.location.reload();
          }} 
        />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return (
      <div className="pt-4 space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-900/40 border border-slate-800" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="pt-4 text-center max-w-sm mx-auto py-16 space-y-4">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-slate-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <HistoryIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">No Sessions Attempted</h3>
        <p className="text-slate-400 text-xs">
          Your completed practice and test sessions will be logged here, letting you review mistakes anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-900">
          <HistoryIcon className="w-4 h-4 text-slate-400" /> Recent Attempts
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Mode</th>
                <th className="py-3 px-4 font-bold">Topics</th>
                <th className="py-3 px-4 font-bold text-center">Score</th>
                <th className="py-3 px-4 font-bold text-center">Accuracy</th>
                <th className="py-3 px-4 font-bold text-center">Duration</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs text-slate-300">
              {history.map((session) => (
                <tr key={session.id} className="hover:bg-slate-900/10 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-[11px] text-slate-400 whitespace-nowrap">
                    {formatDate(session.completedAt)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      'text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider',
                      session.mode === 'practice'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    )}>
                      {session.mode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-[200px] truncate capitalize font-medium text-[11px]">
                    {session.topics.join(', ').replace(/-/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-200">
                    {session.score} / {session.questionCount}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={cn(
                      'font-bold text-[11px]',
                      session.accuracy >= 80 ? 'text-emerald-400' :
                      session.accuracy >= 60 ? 'text-amber-400' :
                      'text-rose-400'
                    )}>
                      {session.accuracy}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">
                    {formatDuration(session.timeTaken)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onReviewSession(session)}
                      className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-fuchsia-400 hover:text-fuchsia-300 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm"
                    >
                      Review Answers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
