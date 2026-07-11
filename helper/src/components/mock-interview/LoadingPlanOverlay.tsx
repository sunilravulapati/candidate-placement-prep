'use client';

// components/mock-interview/LoadingPlanOverlay.tsx
// Full-screen loading overlay shown during interview plan generation.
// Shows a multi-phase pipeline progress indicator.

import { useEffect, useState } from 'react';
import { Cpu, Brain, Sparkles, BarChart3, CheckCircle2, Loader2 } from 'lucide-react';

const PHASES = [
  { id: 'analyzing', label: 'Analyzing your configuration', icon: Brain, duration: 1200 },
  { id: 'planning', label: 'Generating interview plan', icon: Cpu, duration: 3000 },
  { id: 'calibrating', label: 'Calibrating difficulty & topics', icon: BarChart3, duration: 1000 },
  { id: 'generating', label: 'Generating first question', icon: Sparkles, duration: 2000 },
  { id: 'ready', label: 'Interview ready', icon: CheckCircle2, duration: 500 },
];

interface LoadingPlanOverlayProps {
  isVisible: boolean;
  planTitle?: string;
}

export default function LoadingPlanOverlay({ isVisible, planTitle }: LoadingPlanOverlayProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isVisible) { setPhase(0); return; }
    let current = 0;
    const advance = () => {
      if (current < PHASES.length - 1) {
        current++;
        setPhase(current);
        setTimeout(advance, PHASES[current].duration);
      }
    };
    setTimeout(advance, PHASES[0].duration);
    return () => { current = PHASES.length; }; // cleanup
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 opacity-20 animate-pulse" />
            <div className="relative w-full h-full flex items-center justify-center">
              <Cpu className="w-8 h-8 text-violet-400 animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-100">Preparing Your Interview</h3>
            {planTitle && (
              <p className="text-sm text-violet-400 mt-1 font-medium">{planTitle}</p>
            )}
            <p className="text-xs text-slate-600 mt-1">AI is generating a personalized interview plan…</p>
          </div>
        </div>

        {/* Phase indicators */}
        <div className="space-y-3">
          {PHASES.map((p, i) => {
            const Icon = p.icon;
            const isDone = i < phase;
            const isCurrent = i === phase;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 ${
                  isCurrent
                    ? 'bg-violet-600/10 border border-violet-500/20'
                    : isDone
                    ? 'opacity-40'
                    : 'opacity-20'
                }`}
              >
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDone ? 'bg-emerald-500/20' : isCurrent ? 'bg-violet-600/20' : 'bg-slate-800'
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isDone ? 'text-emerald-400' : isCurrent ? 'text-violet-300' : 'text-slate-600'
                }`}>
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
            style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
          />
        </div>
        <p className="text-center text-xs text-slate-700 mt-2">
          This may take 5–15 seconds
        </p>
      </div>
    </div>
  );
}
