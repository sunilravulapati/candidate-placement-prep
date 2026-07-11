'use client';

// components/mock-interview/InterviewHistoryList.tsx
// History tab — past interview sessions with status, score, and reopen capability.

import { useState, useEffect } from 'react';
import { Clock, BarChart3, Building2, Briefcase, Calendar, ExternalLink, Trophy, Loader2 } from 'lucide-react';
import { listInterviewSessionsAction } from '@backend/features/mockInterview/actions';

type Session = Awaited<ReturnType<typeof listInterviewSessionsAction>>[number];

const TYPE_LABELS: Record<string, string> = {
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  HR: 'HR',
  SYSTEM_DESIGN: 'System Design',
  CUSTOM: 'Custom',
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'In Progress', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ABANDONED: { label: 'Abandoned', color: 'text-slate-500 bg-slate-800/60 border-slate-700/30' },
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-600">—</span>;
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-violet-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="flex items-center gap-1.5">
      <Trophy className={`w-3.5 h-3.5 ${color}`} />
      <span className={`text-sm font-bold ${color}`}>{score}</span>
    </div>
  );
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface InterviewHistoryListProps {
  onViewFeedback: (sessionId: string) => void;
}

export default function InterviewHistoryList({ onViewFeedback }: InterviewHistoryListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listInterviewSessionsAction()
      .then(setSessions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading interview history…
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-600 gap-3">
        <Trophy className="w-10 h-10 opacity-30" />
        <p className="text-sm">No interviews yet. Start your first session!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">{sessions.length} sessions completed</p>
      </div>

      {sessions.map(s => {
        const statusCfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.COMPLETED;

        return (
          <div
            key={s.id}
            className="group bg-slate-900/60 border border-slate-800/60 rounded-2xl px-5 py-4 hover:border-slate-700/70 hover:bg-slate-900/80 transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between">
              {/* Left: type + role + company */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-violet-300 bg-violet-600/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                    {TYPE_LABELS[s.type] || s.type}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  {s.templateTitle && (
                    <span className="text-[10px] text-slate-600 truncate max-w-[180px]">{s.templateTitle}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                  {s.targetRole && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {s.targetRole}
                    </span>
                  )}
                  {s.targetCompany && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {s.targetCompany}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {s.durationMinutes}m
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    {s.questionsCount} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(s.createdAt)}
                  </span>
                </div>
              </div>

              {/* Right: score + action */}
              <div className="flex items-center gap-4 sm:ml-4 shrink-0">
                <ScoreBadge score={s.overallScore} />

                {s.status === 'COMPLETED' && (
                  <button
                    id={`view-feedback-${s.id}`}
                    type="button"
                    onClick={() => onViewFeedback(s.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 px-3.5 py-2 rounded-xl transition-all duration-200"
                  >
                    View Feedback
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Topics */}
            {s.topics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.topics.slice(0, 5).map(t => (
                  <span key={t} className="text-[10px] text-slate-600 bg-slate-800/40 border border-slate-700/20 px-2 py-0.5 rounded-full">
                    {t}
                  </span>
                ))}
                {s.topics.length > 5 && (
                  <span className="text-[10px] text-slate-700">+{s.topics.length - 5} more</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
