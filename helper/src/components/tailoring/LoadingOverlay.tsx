'use client';

import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export type LoadingPhase = 
  | 'idle'
  | 'extracting_resume'
  | 'extracting_jd'
  | 'analyzing_resume'
  | 'analyzing_jd'
  | 'comparing'
  | 'generating_recommendations'
  | 'generating_resume'
  | 'saving'
  | 'done';

interface LoadingOverlayProps {
  phase: LoadingPhase;
}

const PHASES = [
  { id: 'extracting_resume', label: 'Extracting Resume Text' },
  { id: 'extracting_jd', label: 'Extracting Job Description' },
  { id: 'analyzing_resume', label: 'Analyzing Resume' },
  { id: 'analyzing_jd', label: 'Analyzing Job Description' },
  { id: 'comparing', label: 'Running AI Match Engine' },
  { id: 'generating_recommendations', label: 'Generating Tailoring Recommendations' },
  { id: 'generating_resume', label: 'Generating Tailored Resume JSON' },
  { id: 'saving', label: 'Saving Tailoring Session' }
];

export function LoadingOverlay({ phase }: LoadingOverlayProps) {
  if (phase === 'idle' || phase === 'done') return null;

  const currentIdx = PHASES.findIndex(p => p.id === phase);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center mb-8">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-slate-100">Tailoring Intelligence</h2>
          <p className="text-sm text-slate-400 text-center mt-2">
            Please wait while our AI compares your resume to the job description and generates actionable recommendations.
          </p>
        </div>

        <div className="space-y-4">
          {PHASES.map((p, i) => {
            const isCompleted = currentIdx > i;
            const isCurrent = currentIdx === i;
            return (
              <div key={p.id} className="flex items-center space-x-3">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-700 shrink-0" />
                )}
                
                <span className={`text-sm font-medium ${isCompleted ? 'text-slate-400' : isCurrent ? 'text-indigo-200' : 'text-slate-600'}`}>
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
