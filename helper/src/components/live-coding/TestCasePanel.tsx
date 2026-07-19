'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Plus, FlaskConical } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { TestCaseResult } from '@/features/live-coding/execution/ExecutionProvider';

interface TestCase {
  input: string;
  displayInput?: string;
  expectedOutput: string;
}

interface TestCasePanelProps {
  testCases?: TestCase[];
  results?: TestCaseResult[];
}

export default function TestCasePanel({
  testCases = [],
  results,
}: TestCasePanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const hasResults = results && results.length > 0;

  const safeTab = Math.min(activeTab, testCases.length - 1);

  useEffect(() => {
    setActiveTab(0);
  }, [testCases]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Case tab bar */}
      <div className="flex px-2 pt-2 border-b border-slate-800 items-end gap-0 overflow-x-auto">
        {testCases.map((_, idx) => {
          const result = hasResults ? results[idx] : undefined;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors shrink-0',
                safeTab === idx
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              )}
            >
              {result && (
                result.passed
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  : <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              )}
              Case {idx + 1}
            </button>
          );
        })}

        <button className="px-3 py-2 text-sm font-medium border-b-2 border-transparent text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors ml-auto shrink-0">
          <Plus className="w-3.5 h-3.5" /> Custom
        </button>
      </div>

      {/* Case content */}
      <div className="p-4 flex-1 overflow-y-auto">
        {testCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
            <FlaskConical className="w-10 h-10 opacity-40" />
            <p className="text-sm">No test cases available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Input
              </label>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-300 border border-slate-800">
                <pre className="whitespace-pre-wrap">
                  {testCases[safeTab]?.displayInput ?? testCases[safeTab]?.input}
                </pre>
              </div>
            </div>

            {/* Expected Output */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Expected Output
              </label>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-300 border border-slate-800">
                <pre className="whitespace-pre-wrap">{testCases[safeTab]?.expectedOutput}</pre>
              </div>
            </div>

            {/* Your Output (only when results exist) */}
            {hasResults && results[safeTab] && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Output
                </label>
                <div
                  className={cn(
                    'rounded-lg p-3 font-mono text-sm border',
                    results[safeTab].passed
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  )}
                >
                  <pre className="whitespace-pre-wrap">
                    {results[safeTab].actualOutput || '(empty)'}
                  </pre>
                </div>
              </div>
            )}

            {/* Per-case timing */}
            {hasResults && results[safeTab]?.executionTimeMs !== undefined && (
              <div className="text-xs text-slate-600">
                Runtime:{' '}
                <span className="text-emerald-400">
                  {results[safeTab].executionTimeMs!.toFixed(1)} ms
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
