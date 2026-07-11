'use client';

// components/mock-interview/InterviewCard.tsx
// Single template card for the Interview Library grid.

import { Clock, BarChart3, Tag, User2, ArrowRight, Zap } from 'lucide-react';

export interface InterviewCardProps {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  experienceLevel: string;
  durationMinutes: number;
  questionCount: number;
  topics: string[];
  companyStyle?: string | null;
  description?: string | null;
  persona?: {
    name: string;
    company?: string | null;
    communicationTone: string;
  } | null;
  onUseTemplate: (id: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  TECHNICAL: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  BEHAVIORAL: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  HR: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  SYSTEM_DESIGN: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  CUSTOM: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  HARD: 'text-rose-400',
};

const DIFFICULTY_DOTS: Record<string, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

export default function InterviewCard({
  id,
  title,
  type,
  difficulty,
  experienceLevel,
  durationMinutes,
  questionCount,
  topics,
  companyStyle,
  description,
  persona,
  onUseTemplate,
}: InterviewCardProps) {
  const typeColor = TYPE_COLORS[type] || TYPE_COLORS.CUSTOM;
  const diffColor = DIFFICULTY_COLORS[difficulty] || 'text-slate-400';
  const dots = DIFFICULTY_DOTS[difficulty] || 2;

  return (
    <div className="group relative bg-slate-900/60 border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-4 hover:border-violet-500/40 hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/10">
      {/* Glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/0 to-indigo-600/0 group-hover:from-violet-600/5 group-hover:to-indigo-600/3 transition-all duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${typeColor}`}>
              {type.replace('_', ' ')}
            </span>
            {companyStyle && (
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {companyStyle}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
        {/* Difficulty dots */}
        <div className={`flex items-center gap-1 shrink-0 mt-0.5 ${diffColor}`}>
          {[1, 2, 3].map(d => (
            <div
              key={d}
              className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                d <= dots ? 'opacity-100 bg-current' : 'opacity-20 bg-current'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-600" />
          {durationMinutes}m
        </span>
        <span className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
          {questionCount} Qs
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-slate-600" />
          {experienceLevel.charAt(0) + experienceLevel.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5">
        {topics.slice(0, 4).map(topic => (
          <span
            key={topic}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/40 px-2 py-0.5 rounded-full"
          >
            <Tag className="w-2.5 h-2.5" />
            {topic}
          </span>
        ))}
        {topics.length > 4 && (
          <span className="text-[10px] text-slate-600 px-1">
            +{topics.length - 4}
          </span>
        )}
      </div>

      {/* Persona */}
      {persona && (
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/40 border border-slate-700/30 rounded-xl px-3 py-2">
          <User2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="truncate">
            <span className="text-slate-300 font-medium">{persona.name}</span>
            {persona.company && (
              <span className="text-slate-600"> · {persona.company}</span>
            )}
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        id={`use-template-${id}`}
        onClick={() => onUseTemplate(id)}
        className="mt-auto w-full flex items-center justify-center gap-2 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-300 text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 group-hover:text-violet-200"
      >
        Use Template
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>
  );
}
