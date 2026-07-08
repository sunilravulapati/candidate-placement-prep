'use client';

import React, { useState, useEffect, memo } from 'react';
import { getTailoringHistoryAction } from '@backend/features/resume/actions';
import { History, Calendar, ChevronRight } from 'lucide-react';
import { SkeletonList, ErrorCard } from '@/components/ui';

interface TailoringHistoryProps {
  resumeId?: string | null;
  onSelectSession: (sessionId: string) => void;
}

export const TailoringHistory = memo(function TailoringHistory({ resumeId, onSelectSession }: TailoringHistoryProps) {
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getTailoringHistoryAction(resumeId)
      .then(setHistory)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load history'))
      .finally(() => setLoading(false));
  }, [resumeId]);

  if (!resumeId) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
        <History className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium text-slate-300">Select a resume to view its tailoring history</p>
        <p className="mt-1 text-xs text-slate-500">History is grouped per resume version.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-6">
        <SkeletonList count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorCard type="database" message={error} />;
  }

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
        <History className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium text-slate-300">No tailoring history found</p>
        <p className="mt-1 text-xs text-slate-500">Start a new tailoring session below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-400">Previous Sessions</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {history.map((session) => {
          const jd = session.jobDescription as {
            originalText?: string;
            analysis?: { role?: string; company?: string };
          } | null;
          const role = jd?.analysis?.role || jd?.originalText?.substring(0, 40) || 'Unknown Role';
          const company = jd?.analysis?.company || 'Unknown Company';
          const matchScore = session.matchScore as number;

          return (
            <button
              key={session.id as string}
              type="button"
              onClick={() => onSelectSession(session.id as string)}
              className="group rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-colors hover:border-indigo-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-bold text-slate-200">{role}</p>
                  <p className="text-xs text-slate-400">{company}</p>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <span
                    className={`text-sm font-extrabold ${
                      matchScore >= 80 ? 'text-emerald-400' : matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {matchScore}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500">Match</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/50 pt-3 text-xs text-slate-500">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(session.createdAt as string).toLocaleDateString()}
                </span>
                <span className="flex items-center text-indigo-400/0 transition-colors group-hover:text-indigo-400">
                  Open <ChevronRight className="ml-0.5 h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
