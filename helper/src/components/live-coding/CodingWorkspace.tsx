'use client';

import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Save,
  Send,
  ChevronRight as Breadcrumb,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
import { executionEngine } from '@/features/live-coding/execution/ExecutionEngine';
import type { ExecutionResult } from '@/features/live-coding/execution/ExecutionProvider';
import type { WorkspaceProblem } from '@backend/features/liveCoding/types';
import {
  recordSubmissionAction,
  saveSessionCodeAction,
  getSavedCodeAction,
} from '@backend/features/liveCoding/actions';

// ── Storage & Storage Instantiation ──────────────────────────────────────────

const draftStorage = new LocalDraftStorage();

// ── Constants ─────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
  MEDIUM: 'text-amber-400 border-amber-400/20 bg-amber-400/10',
  HARD: 'text-rose-400 border-rose-400/20 bg-rose-400/10',
};

const DEFAULT_LANGUAGE: SupportedLanguage = 'cpp';
const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds

type ProblemNavigation = {
  previous: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

type BottomTab = 'testcases' | 'console' | 'review';

// ── Memoized Panels ───────────────────────────────────────────────────────────

const MemoQuestionPanel = memo(QuestionPanel);
const MemoEditorPanel = memo(EditorPanel);
const MemoConsolePanel = memo(ConsolePanel);
const MemoTestCasePanel = memo(TestCasePanel);
const MemoAIReviewPanel = memo(AIReviewPanel);

// ── Verdict Status Label ───────────────────────────────────────────────────────

function getVerdictLabel(result: ExecutionResult | null): string | null {
  if (!result) return null;
  if (result.passed) return 'Accepted';
  switch (result.errorType) {
    case 'COMPILE_ERROR': return 'Compilation Error';
    case 'RUNTIME_ERROR': return 'Runtime Error';
    case 'TIME_LIMIT_EXCEEDED': return 'Time Limit Exceeded';
    case 'MEMORY_LIMIT_EXCEEDED': return 'Memory Limit Exceeded';
    default: return 'Wrong Answer';
  }
}

function getVerdictStatus(result: ExecutionResult | null): 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' {
  if (!result) return 'WRONG_ANSWER';
  if (result.passed) return 'ACCEPTED';
  switch (result.errorType) {
    case 'COMPILE_ERROR': return 'COMPILE_ERROR';
    case 'RUNTIME_ERROR': return 'RUNTIME_ERROR';
    case 'TIME_LIMIT_EXCEEDED': return 'TIME_LIMIT_EXCEEDED';
    case 'MEMORY_LIMIT_EXCEEDED': return 'MEMORY_LIMIT_EXCEEDED';
    default: return 'WRONG_ANSWER';
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface CodingWorkspaceProps {
  problem: WorkspaceProblem;
  navigation: ProblemNavigation;
}

// ──────────────────────────────────────────────────────────────────────────────

export default function CodingWorkspace({
  problem,
  navigation,
}: CodingWorkspaceProps) {
  const problemSlug = problem.slug;

  // State
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Tabs & panels
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('testcases');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);

  // Refs for auto-save inside intervals/events
  const codeRef = useRef(code);
  codeRef.current = code;
  const languageRef = useRef(language);
  languageRef.current = language;
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Code Restoration (DB -> LocalStorage -> Starter) ───────────────────────

  useEffect(() => {
    async function initCode() {
      setIsInitialized(false);
      let restoredLang = DEFAULT_LANGUAGE;
      let restoredCode = '';

      // 1. Try PostgreSQL saved code
      try {
        const dbSave = await getSavedCodeAction(problemSlug);
        if (dbSave?.code && dbSave.code.trim().length > 0) {
          restoredCode = dbSave.code;
          if (isValidLanguage(dbSave.language)) restoredLang = dbSave.language as SupportedLanguage;
          setLanguage(restoredLang);
          setCode(restoredCode);
          setIsInitialized(true);
          return;
        }
      } catch {
        // DB load failed, fall through to localStorage
      }

      // 2. Try localStorage draft
      const draft = draftStorage.loadDraft(problemSlug);
      if (draft?.language && isValidLanguage(draft.language)) {
        restoredLang = draft.language;
      } else {
        const last = draftStorage.getLastLanguage();
        if (last && isValidLanguage(last)) restoredLang = last;
      }

      if (draft?.code && draft.code.trim().length > 0) {
        restoredCode = draft.code;
      } else {
        restoredCode = getStarterTemplate(restoredLang, problem.starterCode);
      }

      setLanguage(restoredLang);
      setCode(restoredCode);
      setIsInitialized(true);
    }

    initCode();
  }, [problemSlug, problem.starterCode]);

  // ── LocalStorage auto-save (debounced) ─────────────────────────────────────

  useEffect(() => {
    if (!isInitialized) return;
    const timer = setTimeout(() => {
      draftStorage.saveDraft(problemSlug, { language, code, updatedAt: Date.now() });
    }, 500);
    return () => clearTimeout(timer);
  }, [code, language, problemSlug, isInitialized]);

  // ── DB auto-save every 30s ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isInitialized) return;

    autoSaveTimerRef.current = setInterval(() => {
      if (codeRef.current.trim()) {
        saveSessionCodeAction(problemSlug, codeRef.current, languageRef.current).catch(() => {});
      }
    }, AUTO_SAVE_INTERVAL_MS);

    const handleUnload = () => {
      if (codeRef.current.trim()) {
        saveSessionCodeAction(problemSlug, codeRef.current, languageRef.current).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [isInitialized, problemSlug]);

  // ── Handlers ────────────────────────────────────────────────────────────────

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
    saveSessionCodeAction(problemSlug, code, language).catch(() => {});
    setSavedAt(Date.now());
    toast.success('Solution draft saved');
    setTimeout(() => setSavedAt(null), 2500);
  }, [problemSlug, language, code]);

  // ── Run (sample tests only via server endpoint) ───────────────────────────

  const handleRunCode = useCallback(async () => {
    setActiveBottomTab('console');
    setIsRunning(true);
    setExecutionResult(null);
    try {
      const resp = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: problem.sampleTests,
        }),
      });
      const res: ExecutionResult = await resp.json();
      setExecutionResult(res);
      if (res.passed) {
        toast.success('Sample tests passed!');
      } else {
        toast.error(getVerdictLabel(res) || 'Execution failed');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setExecutionResult({
        passed: false,
        stdout: '',
        stderr: msg,
        compileOutput: '',
        executionTimeMs: 0,
        memoryBytes: 0,
        errorType: 'RUNTIME_ERROR',
        providerName: executionEngine.getActiveProviderName(),
      });
      toast.error(msg);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, problem.sampleTests]);

  // ── Submit (sample + hidden tests via server endpoint) ───────────────────

  const handleSubmit = useCallback(async () => {
    setActiveBottomTab('console');
    setIsSubmitting(true);
    setExecutionResult(null);

    const allTestCases = [
      ...problem.sampleTests,
      ...problem.hiddenTests,
    ];

    let finalResult: ExecutionResult;

    try {
      const resp = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          testCases: allTestCases,
        }),
      });
      finalResult = await resp.json();
      setExecutionResult(finalResult);

      const status = getVerdictStatus(finalResult);
      await recordSubmissionAction({
        problemSlug,
        language,
        status,
        passedCount: finalResult.testCaseResults?.filter((r) => r.passed).length ?? 0,
        totalCount: allTestCases.length,
        executionTimeMs: finalResult.executionTimeMs,
        memoryBytes: finalResult.memoryBytes,
        codeSnapshot: code,
      });

      if (finalResult.passed) {
        toast.success('Accepted! Solution passed all test cases.');
        setTimeout(() => setActiveBottomTab('review'), 1200);
      } else {
        toast.error(`Submission status: ${getVerdictLabel(finalResult)}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      finalResult = {
        passed: false,
        stdout: '',
        stderr: msg,
        compileOutput: '',
        executionTimeMs: 0,
        memoryBytes: 0,
        errorType: 'RUNTIME_ERROR',
        providerName: executionEngine.getActiveProviderName(),
      };
      setExecutionResult(finalResult);
      toast.error(msg);

      try {
        await recordSubmissionAction({
          problemSlug,
          language,
          status: 'RUNTIME_ERROR',
          passedCount: 0,
          totalCount: allTestCases.length,
          executionTimeMs: 0,
          memoryBytes: 0,
          codeSnapshot: code,
        });
      } catch {
        // Recording failed — non-critical
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [code, language, problem.sampleTests, problem.hiddenTests, problemSlug]);

  const isBusy = isRunning || isSubmitting;
  const verdictLabel = getVerdictLabel(executionResult);
  const topicName = problem.topics[0]?.name ?? 'Problems';

  return (
    <div className="flex-1 w-full h-full min-h-0 flex flex-col bg-[#030712] text-slate-200 overflow-hidden">
      {/* Workspace Header Toolbar */}
      <header className="h-12 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-4 shrink-0 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/dsa"
            className="p-1.5 hover:bg-slate-800/80 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
            title="Back to DSA Studio"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Breadcrumb Navigation */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
            <Link href="/dsa" className="hover:text-slate-200 font-medium transition-colors whitespace-nowrap">DSA Studio</Link>
            <Breadcrumb className="w-3 h-3 text-slate-600 shrink-0" />
            <Link href="/dsa/library" className="hover:text-slate-200 transition-colors whitespace-nowrap">{topicName}</Link>
            <Breadcrumb className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-slate-100 font-semibold truncate">{problem.title}</span>
          </nav>

          {/* Mobile Title */}
          <div className="flex sm:hidden items-center gap-2 min-w-0">
            <span className="font-semibold text-white truncate text-xs">{problem.title}</span>
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

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 font-mono',
              DIFFICULTY_STYLES[problem.difficulty] ?? 'text-slate-400 border-slate-700 bg-slate-800'
            )}
          >
            {problem.difficulty}
          </span>

          {/* Developer-Only Active Execution Provider Indicator */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-slate-500">Engine:</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-200 font-semibold">{executionEngine.getActiveProviderName()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSelector value={language} onChange={handleLanguageChange} />

          <div className="hidden md:flex items-center gap-0.5">
            <Link
              href={navigation.previous ? `/dsa/workspace/${navigation.previous.slug}` : '#'}
              aria-disabled={!navigation.previous}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                navigation.previous
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
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
                'p-1.5 rounded-lg transition-colors',
                navigation.next
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
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
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors disabled:opacity-40"
            title="Save Draft (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          <button
            onClick={handleRunCode}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-xs font-medium border border-slate-700/50 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition-all text-xs font-medium shadow-md shadow-violet-950/40 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
          </button>
        </div>
      </header>

      {/* Main Resizable Panel Layout */}
      <div className="flex-1 w-full h-full min-h-0 overflow-hidden">
        <PanelGroup orientation="horizontal">
          {/* Left Panel: Question Details */}
          <Panel defaultSize={40} minSize={25}>
            <div className="h-full border-r border-slate-800/80 bg-[#030712]">
              <MemoQuestionPanel problem={problem} />
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-[#030712] hover:bg-violet-600/40 transition-colors cursor-col-resize flex items-center justify-center border-x border-slate-900/60">
            <div className="w-0.5 h-6 bg-slate-700/60 rounded-full" />
          </PanelResizeHandle>

          {/* Right Panel: Editor + Console / Test Cases */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup orientation="vertical">
              {/* Top: Monaco Code Editor */}
              <Panel defaultSize={60} minSize={30}>
                <div className="h-full bg-[#0A0E17]">
                  <MemoEditorPanel
                    language={language}
                    code={code}
                    onCodeChange={(newCode: string) => setCode(newCode)}
                    onSave={handleSaveDraft}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-1 bg-[#030712] hover:bg-violet-600/40 transition-colors cursor-row-resize flex items-center justify-center border-y border-slate-900/60">
                <div className="h-0.5 w-6 bg-slate-700/60 rounded-full" />
              </PanelResizeHandle>

              {/* Bottom: Tabs for Test Cases, Console, AI Review */}
              <Panel defaultSize={40} minSize={20}>
                <div className="h-full flex flex-col bg-[#030712] border-t border-slate-800/80">
                  {/* Bottom Bar Tab Controls */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 px-4 bg-slate-950/40 shrink-0 h-9">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveBottomTab('testcases')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                          activeBottomTab === 'testcases'
                            ? 'bg-slate-800/90 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        )}
                      >
                        Test Cases ({problem.sampleTests.length})
                      </button>

                      <button
                        onClick={() => setActiveBottomTab('console')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
                          activeBottomTab === 'console'
                            ? 'bg-slate-800/90 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        )}
                      >
                        <span>Console Output</span>
                        {verdictLabel && (
                          <span
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded font-semibold',
                              executionResult?.passed
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            )}
                          >
                            {verdictLabel}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveBottomTab('review')}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1',
                          activeBottomTab === 'review'
                            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                            : 'text-slate-400 hover:text-slate-200'
                        )}
                      >
                        <span>AI Code Review</span>
                      </button>
                    </div>

                    {executionResult && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        {executionResult.executionTimeMs} ms • {(executionResult.memoryBytes / (1024 * 1024)).toFixed(1)} MB
                      </div>
                    )}
                  </div>

                  {/* Tab Body */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {activeBottomTab === 'testcases' && (
                      <MemoTestCasePanel
                        testCases={problem.sampleTests}
                        results={executionResult?.testCaseResults}
                      />
                    )}

                    {activeBottomTab === 'console' && (
                      <MemoConsolePanel
                        result={executionResult}
                        isRunning={isRunning || isSubmitting}
                        language={language}
                      />
                    )}

                    {activeBottomTab === 'review' && (
                      <MemoAIReviewPanel
                        problem={problem}
                        result={executionResult}
                      />
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
