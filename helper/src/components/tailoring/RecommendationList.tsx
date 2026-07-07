'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, AlertCircle, TrendingUp, Copy } from 'lucide-react';

interface Recommendation {
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedAtsImpact: 'High' | 'Medium' | 'Low';
  whyItMatters: string;
  evidenceFromResume: string;
  evidenceFromJd: string;
  suggestedChange: string;
  affectedSection: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface RecommendationCardProps {
  rec: Recommendation;
  index: number;
  completed: boolean;
  onToggleComplete: () => void;
}

function RecommendationCard({ rec, index, completed, onToggleComplete }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const priorityColor = rec.priority === 'High' ? 'text-rose-400 bg-rose-400/10 border-rose-400/20' 
    : rec.priority === 'Medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' 
    : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';

  const impactColor = rec.estimatedAtsImpact === 'High' ? 'text-rose-400' 
    : rec.estimatedAtsImpact === 'Medium' ? 'text-amber-400' 
    : 'text-emerald-400';

  return (
    <div className={`border rounded-xl transition-all duration-300 ${completed ? 'bg-slate-900/20 border-slate-800/50 opacity-60' : 'bg-slate-900/60 border-slate-700 hover:border-indigo-500/50 shadow-sm hover:shadow-indigo-500/10'}`}>
      <div className="p-4 sm:p-5 flex items-start gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${completed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-600 text-transparent hover:border-emerald-500/50'}`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-md border ${priorityColor}`}>
              {rec.priority} Priority
            </span>
            <span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-800 rounded-md">
              {rec.affectedSection}
            </span>
          </div>
          <h3 className={`text-base font-semibold ${completed ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200'}`}>
            {rec.title}
          </h3>
          {!expanded && !completed && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-1">{rec.suggestedChange}</p>
          )}
        </div>

        <button className="shrink-0 text-slate-500 hover:text-slate-300">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <span className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" /> Why it matters
              </span>
              <p className="text-sm text-slate-300 leading-relaxed">{rec.whyItMatters}</p>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
              <span className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> ATS Impact: <span className={`ml-1 ${impactColor}`}>{rec.estimatedAtsImpact}</span>
              </span>
              <p className="text-sm text-slate-400 leading-relaxed">Difficulty: <span className="text-slate-300 font-medium">{rec.difficulty}</span></p>
            </div>
          </div>

          <div className="space-y-4 relative">
            <div className="pl-4 border-l-2 border-rose-500/30">
              <span className="text-xs font-bold text-rose-400 uppercase mb-1 block">Current Resume</span>
              <p className="text-sm text-slate-300 italic">"{rec.evidenceFromResume}"</p>
            </div>
            
            <div className="pl-4 border-l-2 border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase mb-1 block">Job Description</span>
              <p className="text-sm text-slate-300 italic">"{rec.evidenceFromJd}"</p>
            </div>

            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-indigo-300 uppercase">Suggested Change</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(rec.suggestedChange)}
                  className="text-indigo-400 hover:text-indigo-300"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-indigo-100/90 leading-relaxed whitespace-pre-wrap">{rec.suggestedChange}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());

  if (!recommendations || recommendations.length === 0) return null;

  const toggleComplete = (index: number) => {
    const newSet = new Set(completedSet);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setCompletedSet(newSet);
  };

  const progress = Math.round((completedSet.size / recommendations.length) * 100) || 0;

  // Separate pending and completed for display order
  const pending = recommendations.map((r, i) => ({ r, i })).filter(({ i }) => !completedSet.has(i));
  const completed = recommendations.map((r, i) => ({ r, i })).filter(({ i }) => completedSet.has(i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-200">Tailoring Checklist</h2>
          <p className="text-sm text-slate-400">Complete these AI recommendations to maximize your match score.</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {progress}%
          </span>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Completed</p>
        </div>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-4">
        {pending.map(({ r, i }) => (
          <RecommendationCard key={i} rec={r} index={i} completed={false} onToggleComplete={() => toggleComplete(i)} />
        ))}
        
        {completed.length > 0 && (
          <div className="pt-6 mt-6 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Completed Items</h3>
            <div className="space-y-4">
              {completed.map(({ r, i }) => (
                <RecommendationCard key={i} rec={r} index={i} completed={true} onToggleComplete={() => toggleComplete(i)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
