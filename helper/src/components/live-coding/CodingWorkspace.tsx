'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Save,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import QuestionPanel from './QuestionPanel';
import EditorPanel from './EditorPanel';
import ConsolePanel from './ConsolePanel';
import TestCasePanel from './TestCasePanel';
import AIReviewPanel from './AIReviewPanel';
import LanguageSelector from './LanguageSelector';
import { cn } from '@/lib/cn';
import {
  getStarterTemplate,
  isValidLanguage,
  type SupportedLanguage,
} from '@/features/live-coding/language-config';
import { LocalDraftStorage } from '@/features/live-coding/draft-storage';
import { RealExecutionProvider } from '@/features/live-coding/execution/RealExecutionProvider';
import { MockExecutionProvider } from '@/features/live-coding/execution/MockExecutionProvider';
import type { ExecutionResult } from '@/features/live-coding/execution/ExecutionProvider';
import type { WorkspaceProblem } from '@backend/features/liveCoding/types';

const useRealProvider =
  typeof process !== 'undefined' &&
  Boolean(process.env.NEXT_PUBLIC_JUDGE0_API_KEY);

const executionProvider = useRealProvider
  ? new RealExecutionProvider()
  : new MockExecutionProvider();

const draftStorage = new LocalDraftStorage();

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
  MEDIUM: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
  HARD: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
};

const DEFAULT_LANGUAGE: SupportedLanguage = 'cpp';

type ProblemNavigation = {
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export default function CodingWorkspace({
  problem,
  navigation,
}: {
  problem: WorkspaceProblem;
  navigation: ProblemNavigation;
}) {
  const problemSlug = problem.slug;
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'testcases' | 'console' | 'review'>(
    'testcases'
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setIsInitialized(false);
    setExecutionResult(null);
    setActiveBottomTab('testcases');
    setSavedAt(null);
    setIsRunning(false);
    setIsSubmitting(false);

    const draft = draftStorage.loadDraft(problemSlug);
    let restoredLang: SupportedLanguage = DEFAULT_LANGUAGE;

    if (draft?.language && isValidLanguage(draft.language)) {
      restoredLang = draft.language;
    } else {
      const last = draftStorage.getLastLanguage();
      if (last && isValidLanguage(last)) restoredLang = last;
    }

    setLanguage(restoredLang);
    setCode(
      draft?.code && draft.code.trim().length > 0
        ? draft.code
        : getStarterTemplate(restoredLang, problem.starterCode)
    );
    setIsInitialized(true);
  }, [problemSlug, problem.starterCode]);

  useEffect(() => {
    if (!isInitialized) return;
    const timer = setTimeout(() => {
      draftStorage.saveDraft(problemSlug, { language, code, updatedAt: Date.now() });
    }, 500);
    return () => clearTimeout(timer);
  }, [code, language, problemSlug, isInitialized]);

  const handleLanguageChange = useCallback(
    (newLang: SupportedLanguage) => {
      const currentStarter = getStarterTemplate(language, problem.starterCode);
      setLanguage(newLang);
      draftStorage.saveLastLanguage(newLang);
      if (!code || code.trim() === '' || code === currentStarter) {
        setCode(getStarterTemplate(newLang, problem.starterCode));
      }
    },
    [language, code, problem.starterCode]
  );

  const handleSaveDraft = useCallback(() => {
    draftStorage.saveDraft(problemSlug, { language, code, updatedAt: Date.now() });
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  }, [problemSlug, language, code]);

  const runActiveProblemTests = useCallback(async () => {
    return executionProvider.runTestCases({
      code,
      language,
      testCases: problem.sampleTests,
    });
  }, [code, language, problem.sampleTests]);

  const handleRunCode = useCallback(async () => {
    setActiveBottomTab('console');
    setIsRunning(true);
    setExecutionResult(null);
    try {
      setExecutionResult(await runActiveProblemTests());
    } catch (err) {
      setExecutionResult({
        passed: false,
        stdout: '',
        stderr: err instanceof Error ? err.message : 'An unexpected error occurred.',
        compileOutput: '',
        executionTimeMs: 0,
        memoryBytes: 0,
        errorType: 'RUNTIME_ERROR',
      });
    } finally {
      setIsRunning(false);
    }
  }, [runActiveProblemTests]);

  const handleSubmit = useCallback(async () => {
    setActiveBottomTab('console');
    setIsSubmitting(true);
    setExecutionResult(null);
    try {
      const res = await runActiveProblemTests();
      setExecutionResult(res);
      if (res.passed) {
        setTimeout(() => setActiveBottomTab('review'), 1200);
      }
    } catch (err) {
      setExecutionResult({
        passed: false,
        stdout: '',
        stderr: err instanceof Error ? err.message : 'Submission failed.',
        compileOutput: '',
        executionTimeMs: 0,
        memoryBytes: 0,
        errorType: 'RUNTIME_ERROR',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [runActiveProblemTests]);

  const isBusy = isRunning || isSubmitting;

  return (
    <div
      className="flex flex-col bg-[#0A0A0B] text-slate-200 -mx-4 -mt-4 -mb-4 md:-mx-6 md:-mt-6 md:-mb-6 lg:-mx-8 lg:-mt-8 lg:-mb-8"
      style={{ height: 'calc(100vh - 65px)' }}
    >
      <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dsa/library"
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
            title="Back to library"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-semibold text-white truncate text-sm">{problem.title}</span>
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0',
                DIFFICULTY_STYLES[problem.difficulty] ?? 'text-slate-400 border-slate-700 bg-slate-800'
              )}
            >
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSelector value={language} onChange={handleLanguageChange} />

          <div className="hidden md:flex items-center gap-1">
            <Link
              href={navigation.previous ? `/dsa/workspace/${navigation.previous.slug}` : '#'}
              aria-disabled={!navigation.previous}
              className={cn(
                'p-2 rounded-lg transition-colors',
                navigation.previous
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-700 pointer-events-none'
              )}
              title={navigation.previous ? `Previous: ${navigation.previous.title}` : 'No previous problem'}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <Link
              href={navigation.next ? `/dsa/workspace/${navigation.next.slug}` : '#'}
              aria-disabled={!navigation.next}
              className={cn(
                'p-2 rounded-lg transition-colors',
                navigation.next
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-700 pointer-events-none'
              )}
              title={navigation.next ? `Next: ${navigation.next.title}` : 'No next problem'}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {savedAt && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={isBusy}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Save Draft (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          <button
            onClick={handleRunCode}
            disabled={isBusy}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            {isRunning ? 'Running...' : 'Run'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup orientation="horizontal" id="ws-h">
          <Panel
            defaultSize={35}
            minSize={20}
            className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col mr-1"
          >
            <QuestionPanel key={problem.slug} problem={problem} />
          </Panel>

          <PanelResizeHandle className="w-2 hover:bg-indigo-500/40 transition-colors cursor-col-resize flex items-center justify-center rounded">
            <div className="w-0.5 h-8 bg-slate-700 rounded-full" />
          </PanelResizeHandle>

          <Panel defaultSize={65} minSize={30} className="ml-1 flex flex-col">
            <PanelGroup orientation="vertical" id="ws-v">
              <Panel
                defaultSize={65}
                minSize={20}
                className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden mb-1 flex flex-col"
              >
                <EditorPanel
                  key={problem.slug}
                  language={language}
                  code={code}
                  onCodeChange={setCode}
                  onRun={handleRunCode}
                  onSubmit={handleSubmit}
                  onSave={handleSaveDraft}
                  problemStarters={problem.starterCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 hover:bg-indigo-500/40 transition-colors cursor-row-resize flex items-center justify-center rounded">
                <div className="w-8 h-0.5 bg-slate-700 rounded-full" />
              </PanelResizeHandle>

              <Panel
                defaultSize={35}
                minSize={10}
                className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden mt-1 flex flex-col"
              >
                <div className="flex items-center gap-1 border-b border-slate-800 px-2 py-1 bg-slate-900/60 shrink-0">
                  {(
                    [
                      { key: 'testcases', label: 'Test Cases' },
                      { key: 'console', label: 'Console' },
                      { key: 'review', label: 'AI Review' },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveBottomTab(key)}
                      className={cn(
                        'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        key === 'review'
                          ? activeBottomTab === key
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'text-indigo-400/60 hover:text-indigo-300 hover:bg-indigo-500/10'
                          : activeBottomTab === key
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      )}
                    >
                      {label}
                    </button>
                  ))}

                  {executionResult && (
                    <div className="ml-auto mr-2">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          executionResult.passed
                            ? 'text-emerald-400 bg-emerald-400/10'
                            : 'text-rose-400 bg-rose-400/10'
                        )}
                      >
                        {executionResult.passed
                          ? 'Accepted'
                          : executionResult.errorType?.replace(/_/g, ' ') ?? 'Wrong Answer'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeBottomTab === 'console' && (
                    <ConsolePanel result={executionResult} isRunning={isBusy} language={language} />
                  )}
                  {activeBottomTab === 'testcases' && (
                    <TestCasePanel
                      key={problem.slug}
                      testCases={problem.sampleTests}
                      results={executionResult?.testCaseResults}
                    />
                  )}
                  {activeBottomTab === 'review' && (
                    <AIReviewPanel
                      key={problem.slug}
                      problem={problem}
                      result={executionResult}
                    />
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
