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
  const basicReview = {
    status: passed ? 'ACCEPTED' : result ? 'NEEDS WORK' : 'READY',
    timeComplexity: problem.timeComplexity ?? 'Not specified',
    spaceComplexity: problem.spaceComplexity ?? 'Not specified',
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
    <div className="p-6 h-full bg-[#1e1e1e] overflow-y-auto">
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                passed ? 'bg-emerald-500/20' : 'bg-indigo-500/20'
              )}
            >
              <CheckCircle2 className={cn('w-5 h-5', passed ? 'text-emerald-400' : 'text-indigo-400')} />
            </div>
            <div>
              <h3 className={cn('font-bold text-lg', passed ? 'text-emerald-400' : 'text-indigo-300')}>
                {basicReview.status}
              </h3>
              <p className="text-slate-400 text-sm">{basicReview.summary}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Time Complexity</div>
            <div className="text-indigo-400 font-mono">{basicReview.timeComplexity}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Space Complexity</div>
            <div className="text-indigo-400 font-mono">{basicReview.spaceComplexity}</div>
          </div>
        </div>
      </div>

      {!isDetailed ? (
        <div className="text-center p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-indigo-400" />
          </div>
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">Review {problem.title}</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Get feedback using this problem&apos;s constraints, sample tests, expected approach, and company context.
          </p>
          <button
            onClick={handleGenerateDetailed}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-spin" /> Generating Review...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Get Detailed AI Review
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Correctness', value: passed ? '90%' : result ? '55%' : 'N/A', color: passed ? 'text-emerald-400' : 'text-amber-400' },
              { label: 'Time', value: problem.timeComplexity ?? 'N/A', color: 'text-emerald-400' },
              { label: 'Space', value: problem.spaceComplexity ?? 'N/A', color: 'text-emerald-400' },
              { label: 'Approach', value: problem.expectedApproach ?? 'Review', color: 'text-indigo-300' },
            ].map((metric) => (
              <div key={metric.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-center items-center text-center">
                <div className="text-xs text-slate-400 mb-2 font-medium tracking-wide uppercase">{metric.label}</div>
                <div className={cn('text-lg font-bold', metric.color)}>{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Detailed Feedback
            </h3>
            {[
              {
                type: 'positive',
                text: `The active review context is ${problem.title}, not a cached problem.`,
              },
              {
                type: 'improvement',
                text: problem.expectedApproach
                  ? `Compare your solution against the expected approach: ${problem.expectedApproach}.`
                  : 'Walk through edge cases from the constraints before submitting.',
              },
              {
                type: 'improvement',
                text: `Sample tests loaded for this problem: ${problem.sampleTests.length}.`,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-4 rounded-xl flex gap-3 text-sm border',
                  item.type === 'positive'
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100'
                    : 'bg-amber-500/5 border-amber-500/20 text-amber-100'
                )}
              >
                <div className="shrink-0 mt-0.5">
                  {item.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="leading-relaxed">{item.text}</div>
              </div>
            ))}
          </div>

          {companyReadiness.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" /> Company Readiness
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {companyReadiness.map((company) => (
                  <div key={company.name} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center">
                    <div className="text-slate-300 font-medium mb-2 text-center">{company.name}</div>
                    <div className="text-xl font-bold text-emerald-400">
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
