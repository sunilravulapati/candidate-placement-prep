'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, AlertCircle, TrendingUp, Copy, Check, X, Circle, Undo2 } from 'lucide-react';
import { Button, Progress, Badge } from '@/components/ui';

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

export type RecommendationStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

interface RecommendationCardProps {
  rec: Recommendation;
  status: RecommendationStatus;
  onToggleComplete: () => void;
  onAccept: () => void;
  onReject: () => void;
  onUndo: () => void;
}

function RecommendationCard({ rec, status, onToggleComplete, onAccept, onReject, onUndo }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const completed = status === 'completed';
  const rejected = status === 'rejected';
  const accepted = status === 'accepted' || completed;

  const impactColor = rec.estimatedAtsImpact === 'High' ? 'text-rose-400' 
    : rec.estimatedAtsImpact === 'Medium' ? 'text-amber-400' 
    : 'text-emerald-400';

  return (
    <div className={`border rounded-xl transition-all duration-300 ${completed ? 'bg-slate-900/20 border-slate-800/50 opacity-70' : rejected ? 'bg-slate-950/40 border-slate-800 opacity-60' : 'bg-slate-900/60 border-slate-700 hover:border-indigo-500/50 shadow-sm hover:shadow-indigo-500/10'}`}>
      <div className="p-4 sm:p-5 flex items-start gap-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${completed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : accepted ? 'bg-indigo-500/15 border-indigo-400/50 text-indigo-300' : 'bg-slate-800 border-slate-600 text-slate-500 hover:border-emerald-500/50'}`}
          title="Mark complete"
        >
          {accepted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge variant={rec.priority === 'High' ? 'danger' : rec.priority === 'Medium' ? 'warning' : 'success'}>
              {rec.priority} Priority
            </Badge>
            <Badge variant="default">{rec.affectedSection}</Badge>
          </div>
          <h3 className={`text-base font-semibold ${completed || rejected ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-200'}`}>
            {rec.title}
          </h3>
          {!expanded && !completed && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-1">{rec.suggestedChange}</p>
          )}
        </div>

        <button className="shrink-0 text-slate-500 hover:text-slate-300" title={expanded ? 'Collapse' : 'Expand'}>
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
              <p className="text-sm text-slate-300 italic">&quot;{rec.evidenceFromResume}&quot;</p>
            </div>
            
            <div className="pl-4 border-l-2 border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase mb-1 block">Job Description</span>
              <p className="text-sm text-slate-300 italic">&quot;{rec.evidenceFromJd}&quot;</p>
            </div>

            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-indigo-300 uppercase">Suggested Rewrite</span>
                <button 
                  onClick={async () => {
                    await navigator.clipboard.writeText(rec.suggestedChange);
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-indigo-400 hover:text-indigo-300"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-sm text-indigo-100/90 leading-relaxed whitespace-pre-wrap">{rec.suggestedChange}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                size="sm"
                variant={accepted ? 'success' : 'secondary'}
                onClick={onAccept}
              >
                <Check className="h-3.5 w-3.5" />
                Accept
              </Button>
              <Button
                size="sm"
                variant={rejected ? 'danger' : 'secondary'}
                onClick={onReject}
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
              {(accepted || rejected || completed) && (
                <Button size="sm" variant="ghost" onClick={onUndo}>
                  <Undo2 className="h-3.5 w-3.5" />
                  Undo
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onToggleComplete}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Complete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RecommendationListProps {
  recommendations: Recommendation[];
  statuses: Record<number, 'pending' | 'accepted' | 'rejected' | 'completed'>;
  onStatusChange: (index: number, status: 'pending' | 'accepted' | 'rejected' | 'completed') => void;
}

export function RecommendationList({ recommendations, statuses, onStatusChange }: RecommendationListProps) {
  if (!recommendations || recommendations.length === 0) return null;

  const completedCount = recommendations.filter((_, index) => statuses[index] === 'completed').length;
  const acceptedCount = recommendations.filter((_, index) => statuses[index] === 'accepted' || statuses[index] === 'completed').length;

  const progress = Math.round((completedCount / recommendations.length) * 100) || 0;

  const pending = recommendations.map((r, i) => ({ r, i })).filter(({ i }) => statuses[i] !== 'completed');
  const completed = recommendations.map((r, i) => ({ r, i })).filter(({ i }) => statuses[i] === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-200">Tailoring Checklist</h2>
          <p className="text-sm text-slate-400">{acceptedCount} accepted for generation. Complete items as you apply them.</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            {progress}%
          </span>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Completed</p>
        </div>
      </div>

      <Progress value={progress} className="mb-6" />

      <div className="space-y-4">
        {pending.map(({ r, i }) => (
          <RecommendationCard
            key={i}
            rec={r}
            status={statuses[i] || 'pending'}
            onAccept={() => onStatusChange(i, 'accepted')}
            onReject={() => onStatusChange(i, 'rejected')}
            onUndo={() => onStatusChange(i, 'pending')}
            onToggleComplete={() => onStatusChange(i, statuses[i] === 'completed' ? 'accepted' : 'completed')}
          />
        ))}
        
        {completed.length > 0 && (
          <div className="pt-6 mt-6 border-t border-slate-800">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Completed Items</h3>
            <div className="space-y-4">
              {completed.map(({ r, i }) => (
                <RecommendationCard
                  key={i}
                  rec={r}
                  status="completed"
                  onAccept={() => onStatusChange(i, 'accepted')}
                  onReject={() => onStatusChange(i, 'rejected')}
                  onUndo={() => onStatusChange(i, 'pending')}
                  onToggleComplete={() => onStatusChange(i, 'accepted')}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
