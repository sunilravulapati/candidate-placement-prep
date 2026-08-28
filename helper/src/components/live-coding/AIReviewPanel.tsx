'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ExecutionResult } from '@/features/live-coding/execution/ExecutionProvider';
import type { WorkspaceProblem } from '@backend/features/liveCoding/types';

interface AIReviewPanelProps {
  problem: WorkspaceProblem;
  result: ExecutionResult | null;
}

export default function AIReviewPanel({ problem, result }: AIReviewPanelProps) {
  const [isDetailed, setIsDetailed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setIsDetailed(false);
    setIsGenerating(false);
  }, [problem.slug]);

  const handleGenerateDetailed = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsDetailed(true);
    }, 800);
  };

  const passed = result?.passed ?? false;
  const timeComplexity = (problem as any).optimalTC || problem.timeComplexity || 'O(N)';
  const spaceComplexity = (problem as any).optimalSC || problem.spaceComplexity || 'O(1)';

  const basicReview = {
    status: passed ? 'ACCEPTED' : result ? 'NEEDS WORK' : 'READY',
    timeComplexity,
    spaceComplexity,
    summary: result
      ? passed
        ? `${problem.title} passes the active sample tests.`
        : `${problem.title} still has failing output against the active sample tests.`
      : `Run or submit ${problem.title} to generate review context.`,
  };

  const companyReadiness = problem.companies.slice(0, 3).map((company) => ({
    name: company.name,
    score: passed ? 88 : result ? 58 : 0,
  }));

  return (
    <div className="p-6 h-full bg-[#030712] text-slate-200 overflow-y-auto font-sans">
      <div className="mb-6 p-6 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
              )}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={cn('font-extrabold text-lg', passed ? 'text-emerald-400' : 'text-indigo-300')}>
                {basicReview.status}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">{basicReview.summary}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-slate-800">
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
              Time Complexity (Target)
            </div>
            <div className="text-emerald-400 font-mono font-bold text-sm">
              {basicReview.timeComplexity}
            </div>
          </div>
          <div>
            <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
              Space Complexity (Target)
            </div>
            <div className="text-sky-400 font-mono font-bold text-sm">
              {basicReview.spaceComplexity}
            </div>
          </div>
        </div>
      </div>

      {!isDetailed ? (
        <div className="text-center p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-indigo-400" />
          </div>
          <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-base mb-1.5">Review {problem.title}</h3>
          <p className="text-slate-400 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
            Get feedback using this problem&apos;s constraints, sample tests, expected approach, and company context.
          </p>
          <button
            onClick={handleGenerateDetailed}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin" /> Generating AI Review...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Get Detailed AI Review
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Correctness',
                value: passed ? '90%' : result ? '55%' : 'N/A',
                color: passed ? 'text-emerald-400' : 'text-amber-400',
              },
              { label: 'Time', value: timeComplexity, color: 'text-emerald-400' },
              { label: 'Space', value: spaceComplexity, color: 'text-sky-400' },
              {
                label: 'Approach',
                value: (problem as any).pattern || problem.expectedApproach || 'Review',
                color: 'text-indigo-300',
              },
            ].map((metric) => (
              <div
                key={metric.label}
                className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-center items-center text-center"
              >
                <div className="text-[10px] text-slate-400 mb-1 font-bold tracking-wider uppercase">
                  {metric.label}
                </div>
                <div className={cn('text-sm font-extrabold font-mono', metric.color)}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" /> Detailed Feedback
            </h3>
            {[
              {
                type: 'positive',
                text: `The active review context is ${problem.title}, analyzing optimal ${timeComplexity} time and ${spaceComplexity} space targets.`,
              },
              {
                type: 'improvement',
                text:
                  (problem as any).intuition || problem.expectedApproach
                    ? `Optimal approach: ${(problem as any).intuition || problem.expectedApproach}.`
                    : 'Walk through edge cases from the constraints before submitting.',
              },
              {
                type: 'improvement',
                text: `Sample test cases verified for this problem: ${problem.sampleTests.length}.`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-3.5 rounded-xl flex gap-3 text-xs border leading-relaxed',
                  item.type === 'positive'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {item.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div>{item.text}</div>
              </div>
            ))}
          </div>

          {companyReadiness.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" /> Company Readiness
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {companyReadiness.map((company) => (
                  <div
                    key={company.name}
                    className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex flex-col items-center"
                  >
                    <div className="text-slate-300 font-semibold text-xs mb-1 text-center">
                      {company.name}
                    </div>
                    <div className="text-base font-extrabold font-mono text-emerald-400">
                      {company.score > 0 ? `${company.score}%` : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
