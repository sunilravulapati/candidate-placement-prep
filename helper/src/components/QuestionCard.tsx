// src/components/QuestionCard.tsx
'use client';

import { Question } from '../lib/questions';
import { 
  Play, 
  Bookmark, 
  Clock, 
  CheckCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-950/30 border-emerald-500/20 text-emerald-400';
      case 'in_progress':
        return 'bg-amber-950/30 border-amber-500/20 text-amber-400';
      default:
        return 'bg-slate-900 border-slate-800 text-slate-400';
    }
  };

  return (
    <div className="glass-card rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col group">
      {/* Decorative hover gradient lines */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyStyles(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${getStatusStyles(question.status)}`}>
                {question.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 group-hover:text-violet-400 transition-colors">
              {question.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {question.description}
            </p>
          </div>

          <div className="flex space-x-2 shrink-0">
            <button className="bg-slate-950/60 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200 p-2 rounded-xl transition-colors">
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/30 px-6 py-4 border-t border-slate-900/40 flex justify-between items-center rounded-b-2xl">
        <div className="flex space-x-4">
          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" /> 
            {question.timeEstimate} min
          </span>
          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            {question.category}
          </span>
        </div>
        
        <Link 
          href={`/questions/${question.id}`}
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-violet-600/10 transition-colors"
        >
          <span>Solve</span>
          <Play className="w-2.5 h-2.5 fill-white text-white" />
        </Link>
      </div>
    </div>
  );
}