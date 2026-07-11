'use client';

// components/mock-interview/QuestionCard.tsx
// Displays the current active interview question in the center panel.

import React from 'react';
import { Tag, Clock, Zap, ChevronRight, MessageSquarePlus } from 'lucide-react';

interface QuestionCardProps {
  questionText: string;
  category: string;
  difficulty: string;
  estimatedTimeSec: number;
  questionNumber: number;
  totalQuestions: number;
  isFollowUp?: boolean;
  followUpTrigger?: string;
}

const DIFFICULTY_CONFIG = {
  EASY: { label: 'Easy', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  HARD: { label: 'Hard', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
};

const FOLLOWUP_TRIGGER_LABELS: Record<string, string> = {
  missing_concepts: 'Missing key concepts',
  vague_explanation: 'Explanation was vague',
  contradiction: 'Answer had contradictions',
  shallow_answer: 'Answer needs more depth',
  incomplete_example: 'Example was incomplete',
};

export default React.memo(function QuestionCard({
  questionText,
  category,
  difficulty,
  estimatedTimeSec,
  questionNumber,
  totalQuestions,
  isFollowUp = false,
  followUpTrigger,
}: QuestionCardProps) {
  const diffConfig = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || DIFFICULTY_CONFIG.MEDIUM;
  const estimatedMin = Math.floor(estimatedTimeSec / 60);
  const estimatedSec = estimatedTimeSec % 60;

  return (
    <div className="relative bg-slate-900/70 border border-slate-800/70 rounded-2xl overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Follow-up banner */}
      {isFollowUp && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/8 border-b border-amber-500/15">
          <MessageSquarePlus className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-400 font-semibold">
            Follow-up Question
            {followUpTrigger && FOLLOWUP_TRIGGER_LABELS[followUpTrigger] ? (
              <span className="text-amber-400/60 font-normal"> — {FOLLOWUP_TRIGGER_LABELS[followUpTrigger]}</span>
            ) : null}
          </span>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Q{questionNumber} / {totalQuestions}
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />

            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-800/60 border border-slate-700/40 px-2.5 py-1 rounded-full">
              <Tag className="w-3 h-3 text-slate-500" />
              {category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${diffConfig.bg} ${diffConfig.text} ${diffConfig.border}`}>
              {diffConfig.label}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-900/60 border border-slate-800/40 px-2.5 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              ~{estimatedMin > 0 ? `${estimatedMin}m` : ''}{estimatedSec > 0 ? `${estimatedSec}s` : ''}
            </span>
          </div>
        </div>

        {/* Question text */}
        <div className="py-2">
          <p className="text-slate-100 text-base sm:text-lg leading-relaxed font-medium">
            {questionText}
          </p>
        </div>

        {/* Tip bar */}
        <div className="flex items-start gap-2 bg-violet-950/30 border border-violet-900/20 rounded-xl px-4 py-3">
          <Zap className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <p className="text-xs text-violet-400/80 leading-relaxed">
            {difficulty === 'HARD'
              ? 'Think out loud. Show your reasoning process step by step.'
              : difficulty === 'MEDIUM'
              ? 'Structure your answer: state your approach, then elaborate with examples.'
              : 'Be specific and use concrete examples from your experience.'}
          </p>
        </div>
      </div>
    </div>
  );
});
