'use client';

// components/mock-interview/ProgressSidebar.tsx
// Right sidebar for Interview Room: timer, progress, stage, topics coverage, notes.

import React, { useState } from 'react';
import { Target, ListChecks, MessageSquare, ChevronRight, BookOpen } from 'lucide-react';
import InterviewTimer from './InterviewTimer';

interface Question {
  id: string;
  questionText: string;
  category: string;
  status: string;
  isFollowUp?: boolean;
  orderIndex: number;
}

interface Stage {
  name: string;
  questionCount: number;
}

interface ProgressSidebarProps {
  totalMinutes: number;
  startedAt: Date;
  questions: Question[];
  topics: string[];
  answeredTopics: string[];
  stages: Stage[];
  onExpire?: () => void;
}

export default React.memo(function ProgressSidebar({
  totalMinutes,
  startedAt,
  questions,
  topics,
  answeredTopics,
  stages,
  onExpire,
}: ProgressSidebarProps) {
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const answeredCount = questions.filter(q => q.status === 'ANSWERED').length;
  // Calculate total questions expected from stages
  const totalQuestions = Math.max(
    questions.length,
    stages.reduce((sum, s) => sum + s.questionCount, 0)
  );
  
  // Determine current stage
  let currentStageName = stages[0]?.name || 'Interview';
  let qSum = 0;
  for (const s of stages) {
    qSum += s.questionCount;
    if (answeredCount < qSum) {
      currentStageName = s.name;
      break;
    }
  }

  const remainingTopics = topics.filter(t => !answeredTopics.includes(t));

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto no-scrollbar">

      {/* Memoized Timer */}
      <InterviewTimer startedAt={startedAt} totalMinutes={totalMinutes} onExpire={onExpire} />

      {/* Progress & Stage */}
      <div className="bg-slate-900/70 border border-slate-800/70 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5" /> Progress
          </span>
          <span className="text-slate-300 font-bold">{answeredCount} / {totalQuestions}</span>
        </div>
        
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: totalQuestions > 0 ? `${(answeredCount / totalQuestions) * 100}%` : '0%' }}
          />
        </div>

        <div className="pt-2 border-t border-slate-800/60">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Current Stage</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300">
            <Target className="w-3.5 h-3.5" />
            {currentStageName}
          </div>
        </div>
      </div>

      {/* Topics Tracking */}
      <div className="bg-slate-900/70 border border-slate-800/70 rounded-2xl p-4 space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Topics
        </div>

        {/* Covered */}
        {answeredTopics.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-500 font-medium">Covered</div>
            <div className="flex flex-wrap gap-1.5">
              {answeredTopics.map(t => (
                <span
                  key={t}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 line-through opacity-60 transition-all"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Remaining */}
        {remainingTopics.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-slate-500 font-medium">Remaining</div>
            <div className="flex flex-wrap gap-1.5">
              {remainingTopics.map(t => (
                <span
                  key={t}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-400 transition-all"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-slate-900/70 border border-slate-800/70 rounded-2xl overflow-hidden mt-auto">
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Private Notes
          </span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showNotes ? 'rotate-90' : ''}`} />
        </button>
        {showNotes && (
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Jot down ideas, formulas, key points…"
            rows={6}
            className="w-full bg-slate-950/40 border-t border-slate-800/60 px-4 py-3 text-xs text-slate-300 placeholder-slate-700 focus:outline-none resize-none"
          />
        )}
      </div>
    </div>
  );
});
