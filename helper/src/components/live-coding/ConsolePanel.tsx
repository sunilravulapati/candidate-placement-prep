'use client';

import React, { useState } from 'react';
import {
  Terminal,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  Code2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ExecutionResult, ExecutionErrorType } from '@/features/live-coding/execution/ExecutionProvider';

type SubTab = 'test-results' | 'console' | 'execution';

interface ConsolePanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
  language?: string;
}

// ── Status badge ──────────────────────────────────────────────────────────────
interface StatusConfig {
  label: string;
  className: string;
  icon: React.ReactNode;
}

function getStatusConfig(result: ExecutionResult): StatusConfig {
  if (result.passed) {
    return {
      label: 'Accepted',
      className: 'text-emerald-400',
      icon: <CheckCircle2 className="w-4 h-4" />,
    };
  }
  const map: Record<ExecutionErrorType, StatusConfig> = {
    COMPILE_ERROR: {
      label: 'Compilation Error',
      className: 'text-rose-400',
      icon: <Code2 className="w-4 h-4" />,
    },
    RUNTIME_ERROR: {
      label: 'Runtime Error',
      className: 'text-rose-400',
      icon: <XCircle className="w-4 h-4" />,
    },
    TIME_LIMIT_EXCEEDED: {
      label: 'Time Limit Exceeded',
      className: 'text-amber-400',
      icon: <Clock className="w-4 h-4" />,
    },
    MEMORY_LIMIT_EXCEEDED: {
      label: 'Memory Limit Exceeded',
      className: 'text-amber-400',
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    WRONG_ANSWER: {
      label: 'Wrong Answer',
      className: 'text-rose-400',
      icon: <XCircle className="w-4 h-4" />,
    },
  };
  return result.errorType
    ? map[result.errorType]
    : map.WRONG_ANSWER;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ConsolePanel({ result, isRunning, language }: ConsolePanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('test-results');

  // Loading state
  if (isRunning) {
    return (
      <div className="flex flex-col h-full bg-[#1e1e1e] items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        <span className="text-slate-400 text-sm">Executing code…</span>
        <span className="text-slate-600 text-xs">Compiling and running against test cases</span>
      </div>
    );
  }

  // Empty state
  if (!result) {
    return (
      <div className="flex flex-col h-full bg-[#1e1e1e] items-center justify-center gap-3 text-center">
        <Terminal className="w-10 h-10 text-slate-700" />
        <p className="text-slate-500 text-sm">Run your code to see the output here</p>
        <p className="text-slate-700 text-xs">
          Press{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-500 text-[10px]">
            Ctrl+Enter
          </kbd>{' '}
          to run
        </p>
      </div>
    );
  }

  const statusCfg = getStatusConfig(result);
  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: 'test-results', label: 'Test Results' },
    { key: 'console', label: 'Console' },
    { key: 'execution', label: 'Execution' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Sub-tab bar */}
      <div className="flex items-center border-b border-slate-800 px-3 pt-1.5 shrink-0 gap-1">
        {SUB_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSubTab(key)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium border-b-2 transition-colors mr-0.5 pb-2',
              activeSubTab === key
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            )}
          >
            {label}
          </button>
        ))}

        {/* Status badge aligned to right */}
        <div className={cn('ml-auto pb-1 flex items-center gap-1.5 text-sm font-semibold', statusCfg.className)}>
          {statusCfg.icon}
          {statusCfg.label}
        </div>
      </div>

      {/* Sub-tab content */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {activeSubTab === 'test-results' && <TestResultsTab result={result} />}
        {activeSubTab === 'console' && <ConsoleOutputTab result={result} />}
        {activeSubTab === 'execution' && <ExecutionMetricsTab result={result} language={language} />}
      </div>
    </div>
  );
}

// ── Test Results Sub-tab ──────────────────────────────────────────────────────
function TestResultsTab({ result }: { result: ExecutionResult & { executionMode?: string; visibleStats?: { passed: number; total: number }; hiddenStats?: { passed: number; total: number }; visibleCaseResults?: any[]; hiddenCaseResultsSanitized?: any[] } }) {
  const isSubmitMode = result.executionMode === 'submit';
  const visibleCases = result.visibleCaseResults || result.testCaseResults || [];
  const hiddenCases = result.hiddenCaseResultsSanitized || [];

  const [activeCase, setActiveCase] = useState(0);

  if (isSubmitMode) {
    const visStats = result.visibleStats || { passed: visibleCases.filter((c: any) => c.passed).length, total: visibleCases.length };
    const hidStats = result.hiddenStats || { passed: hiddenCases.filter((c: any) => c.passed).length, total: hiddenCases.length };
    const isOverallAccepted = result.passed;

    return (
      <div className="space-y-5">
        {/* Submit Execution Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Submission Results</span>
            <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', isOverallAccepted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30')}>
              {isOverallAccepted ? 'Accepted' : (result.errorType || 'Wrong Answer')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Visible Tests</span>
              <span className={cn('font-mono font-bold', visStats.passed === visStats.total ? 'text-emerald-400' : 'text-rose-400')}>
                {visStats.passed} / {visStats.total}
              </span>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 font-semibold">Hidden Tests</span>
              <span className={cn('font-mono font-bold', hidStats.passed === hidStats.total ? 'text-emerald-400' : 'text-rose-400')}>
                {hidStats.passed} / {hidStats.total}
              </span>
            </div>
          </div>
        </div>

        {/* Visible Test Case Inspection */}
        {visibleCases.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Visible Tests</h4>
            <div className="flex gap-1.5 flex-wrap">
              {visibleCases.map((c: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveCase(i)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5',
                    activeCase === i
                      ? c.passed
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  )}
                >
                  {c.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
                  Example {i + 1}
                </button>
              ))}
            </div>

            {visibleCases[activeCase] && (
              <div className="space-y-3 pt-1">
                {visibleCases[activeCase].input && <InfoBlock label="Input" value={visibleCases[activeCase].input} />}
                <InfoBlock label="Expected Output" value={visibleCases[activeCase].expectedOutput} />
                <InfoBlock label="Your Output" value={visibleCases[activeCase].actualOutput || '(empty)'} variant={visibleCases[activeCase].passed ? 'success' : 'error'} />
              </div>
            )}
          </div>
        )}

        {/* Hidden Test Case Status List (SECURED: No hidden inputs or outputs revealed) */}
        {hiddenCases.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Hidden Tests Status</span>
              <span className="text-[10px] text-slate-500 normal-case font-normal">(Hidden test inputs are masked)</span>
            </h4>
            <div className="space-y-2">
              {hiddenCases.map((hc: any, i: number) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {hc.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
                    <span className="font-semibold text-slate-300">Hidden Test #{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className={cn('font-bold', hc.passed ? 'text-emerald-400' : 'text-rose-400')}>
                      {hc.passed ? 'Passed' : (hc.errorType || 'Failed')}
                    </span>
                    {hc.executionTimeMs !== undefined && hc.executionTimeMs > 0 && (
                      <span className="text-slate-500">{hc.executionTimeMs.toFixed(1)} ms</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // RUN MODE
  if (visibleCases.length === 0) {
    return (
      <div className="text-slate-500 flex items-center gap-2 p-4">
        <Terminal className="w-4 h-4" />
        <span>No sample test case output available for this run.</span>
      </div>
    );
  }

  const tc = visibleCases[activeCase] || visibleCases[0];

  return (
    <div className="space-y-4">
      {/* Visible Case Selector */}
      <div className="flex gap-1.5 flex-wrap">
        {visibleCases.map((c: any, i: number) => (
          <button
            key={i}
            onClick={() => setActiveCase(i)}
            className={cn(
              'px-3 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5',
              activeCase === i
                ? c.passed
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
            )}
          >
            {c.passed ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <XCircle className="w-3 h-3 text-rose-400" />
            )}
            Example {i + 1}
          </button>
        ))}
      </div>

      {/* Visible Case Detail */}
      {tc && (
        <div className="space-y-3">
          {tc.input && (
            <InfoBlock label="Input" value={tc.input} />
          )}
          <InfoBlock label="Expected Output" value={tc.expectedOutput} />
          <InfoBlock
            label="Your Output"
            value={tc.actualOutput || '(empty)'}
            variant={tc.passed ? 'success' : 'error'}
          />
          {tc.executionTimeMs !== undefined && (
            <div className="flex gap-4 text-xs text-slate-500 pt-1">
              <span>
                Runtime:{' '}
                <span className="text-emerald-400 font-semibold">
                  {tc.executionTimeMs.toFixed(1)} ms
                </span>
              </span>
              {tc.memoryBytes !== undefined && tc.memoryBytes > 0 && (
                <span>
                  Memory:{' '}
                  <span className="text-indigo-400 font-semibold">
                    {(tc.memoryBytes / 1024 / 1024).toFixed(1)} MB
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Console Output Sub-tab ────────────────────────────────────────────────────
function ConsoleOutputTab({ result }: { result: ExecutionResult }) {
  const hasCompile = result.compileOutput?.trim();
  const hasStderr = result.stderr?.trim();
  const hasStdout = result.stdout?.trim();

  if (!hasCompile && !hasStderr && !hasStdout) {
    return <div className="text-slate-600 text-xs">No console output for this run.</div>;
  }

  return (
    <div className="space-y-4">
      {hasCompile && (
        <section className="space-y-1.5">
          <div className="text-xs text-rose-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5" /> Compilation Output
          </div>
          <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-lg">
            <pre className="text-rose-300 whitespace-pre-wrap text-xs leading-relaxed">
              {result.compileOutput}
            </pre>
          </div>
        </section>
      )}

      {hasStderr && !hasCompile && (
        <section className="space-y-1.5">
          <div className="text-xs text-rose-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Standard Error
          </div>
          <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
            <pre className="text-rose-300 whitespace-pre-wrap text-xs leading-relaxed">
              {result.stderr}
            </pre>
          </div>
        </section>
      )}

      {hasStdout && (
        <section className="space-y-1.5">
          <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">
            Standard Output
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
            <pre className="text-slate-300 whitespace-pre-wrap text-xs leading-relaxed">
              {result.stdout}
            </pre>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Execution Metrics Sub-tab ─────────────────────────────────────────────────
const STATUS_PANEL: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  ACCEPTED: { label: 'Accepted', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  WRONG_ANSWER: { label: 'Wrong Answer', bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400' },
  COMPILE_ERROR: { label: 'Compilation Error', bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400' },
  RUNTIME_ERROR: { label: 'Runtime Error', bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400' },
  TIME_LIMIT_EXCEEDED: { label: 'Time Limit Exceeded', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
  MEMORY_LIMIT_EXCEEDED: { label: 'Memory Limit Exceeded', bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
};

function ExecutionMetricsTab({
  result,
  language,
}: {
  result: ExecutionResult;
  language?: string;
}) {
  const statusKey = result.errorType ?? (result.passed ? 'ACCEPTED' : 'WRONG_ANSWER');
  const cfg = STATUS_PANEL[statusKey] ?? STATUS_PANEL.WRONG_ANSWER;

  const metrics = [
    {
      label: 'Runtime',
      value:
        result.executionTimeMs === 0 ? 'N/A' : `${result.executionTimeMs.toFixed(1)} ms`,
      icon: <Clock className="w-3.5 h-3.5 text-emerald-400" />,
      color: 'text-emerald-400',
    },
    {
      label: 'Memory',
      value:
        result.memoryBytes > 0
          ? `${(result.memoryBytes / 1024 / 1024).toFixed(1)} MB`
          : 'N/A',
      icon: <Database className="w-3.5 h-3.5 text-indigo-400" />,
      color: 'text-indigo-400',
    },
    {
      label: 'Language',
      value: language
        ? language.charAt(0).toUpperCase() + language.slice(1)
        : 'Unknown',
      icon: <Code2 className="w-3.5 h-3.5 text-slate-400" />,
      color: 'text-slate-300',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div
        className={cn(
          'p-3 rounded-xl border text-center font-bold text-sm',
          cfg.bg,
          cfg.text
        )}
      >
        {cfg.label}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2"
          >
            <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase font-bold tracking-wider">
              {m.icon}
              {m.label}
            </div>
            <div className={cn('font-semibold font-mono text-sm', m.color)}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {result.testCaseResults && (
        <div className="text-xs text-slate-500 pt-1">
          <span className="text-slate-400 font-medium">
            {result.testCaseResults.filter((r) => r.passed).length}
          </span>
          {' / '}
          <span className="text-slate-400 font-medium">
            {result.testCaseResults.length}
          </span>{' '}
          test cases passed
        </div>
      )}
    </div>
  );
}

// ── Shared Info Block ─────────────────────────────────────────────────────────
function InfoBlock({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'error';
}) {
  const containerClass =
    variant === 'success'
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
      : variant === 'error'
      ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
      : 'bg-slate-900/80 border-slate-800 text-slate-300';

  return (
    <div className="space-y-1.5">
      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{label}</div>
      <div className={cn('rounded-lg p-3 border', containerClass)}>
        <pre className="whitespace-pre-wrap break-all text-xs leading-relaxed">{value}</pre>
      </div>
    </div>
  );
}
