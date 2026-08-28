'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  Sparkles,
  FileText,
  Clock,
  Flame,
  Award,
  ExternalLink,
  Code2,
  CheckCircle,
  CheckCircle2,
  Zap,
  Building2,
  Terminal,
  Copy,
  Send,
  Loader2,
  Check,
  AlertTriangle,
  Mic2,
  Layers,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  Timer,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { WorkspaceProblem } from '@backend/features/liveCoding/types';

interface QuestionPanelProps {
  problem: WorkspaceProblem;
}

type SolutionLanguage = 'cpp' | 'python' | 'java' | 'javascript' | 'typescript';

export default function QuestionPanel({ problem }: QuestionPanelProps) {
  const [activeTab, setActiveTab] = useState<
    'description' | 'interview-lens' | 'editorial' | 'solution' | 'ai-explain' | 'notes'
  >('description');
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [solutionLang, setSolutionLang] = useState<SolutionLanguage>('cpp');
  const [guideLang, setGuideLang] = useState<SolutionLanguage>('cpp');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  useEffect(() => {
    setActiveTab('description');
  }, [problem.slug]);

  const handleCopyGuideSnippet = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopySolution = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const diffColor =
    problem.difficulty === 'EASY'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : problem.difficulty === 'MEDIUM'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  const targetTime = (problem as any).optimalTC || problem.timeComplexity || 'O(N)';
  const targetSpace = (problem as any).optimalSC || problem.spaceComplexity || 'O(1)';

  const inputHelperData = (problem as any).inputHelper;
  const guideSnippets = inputHelperData?.snippets || {};
  const currentGuideSnippet =
    guideSnippets[guideLang] || getDefaultInputSnippet(guideLang, problem);

  const referenceSols = problem.referenceSolutions || {};
  const currentRefSolution =
    referenceSols[solutionLang] ||
    referenceSols[
      solutionLang === 'javascript' ? 'js' : solutionLang === 'typescript' ? 'ts' : solutionLang
    ] ||
    '// Reference solution not available for this language.';

  return (
    <div className="flex flex-col h-full bg-[#030712] text-slate-200 overflow-hidden font-sans">
      {/* Top Tab Bar */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/60 px-3 pt-2 overflow-x-auto no-scrollbar shrink-0">
        <button
          onClick={() => setActiveTab('description')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap',
            activeTab === 'description'
              ? 'border-violet-500 text-white bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Description
        </button>
        <button
          onClick={() => setActiveTab('interview-lens')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap',
            activeTab === 'interview-lens'
              ? 'border-violet-500 text-violet-200 bg-violet-500/15'
              : 'border-transparent text-violet-400/80 hover:text-violet-200'
          )}
        >
          <Mic2 className="w-3.5 h-3.5 text-violet-400" />
          <span>Interview Lens</span>
          <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-violet-500/20 text-violet-300">
            Guide
          </span>
        </button>
        <button
          onClick={() => setActiveTab('editorial')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap',
            activeTab === 'editorial'
              ? 'border-violet-500 text-white bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Editorial & Notes
        </button>
        <button
          onClick={() => setActiveTab('solution')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap',
            activeTab === 'solution'
              ? 'border-violet-500 text-white bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Solution
        </button>
        <button
          onClick={() => setActiveTab('ai-explain')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap',
            activeTab === 'ai-explain'
              ? 'border-violet-500 text-violet-300 bg-violet-500/10'
              : 'border-transparent text-violet-400/70 hover:text-violet-300'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Tutor
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap',
            activeTab === 'notes'
              ? 'border-violet-500 text-white bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* ================================================================= */}
        {/* TAB 1: DESCRIPTION */}
        {/* ================================================================= */}
        {activeTab === 'description' && (
          <div className="space-y-5">
            {/* Header Metadata Section */}
            <div className="space-y-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-slate-500">#{problem.questionNo || 1}</span>
                  <h1 className="text-xl font-extrabold text-white tracking-tight">{problem.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  {((problem as any).isSolved || problem.status === 'SOLVED') && (
                    <span className="px-2.5 py-1 rounded-full border text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Solved
                    </span>
                  )}
                  {((problem as any).isV2Pending ||
                    (problem as any).executionStatus === 'V2_PENDING' ||
                    (problem as any).stdinStatus === 'REVIEW') && (
                    <span className="px-2.5 py-1 rounded-full border text-xs font-bold font-mono text-amber-300 bg-amber-500/10 border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> V2 PENDING
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-1 rounded-full border text-xs font-bold font-mono ${diffColor}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
              </div>

              {/* Target Complexity Badge Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Timer className="w-3 h-3 text-indigo-400" /> Target Complexity:
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Time: {targetTime}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                    Space: {targetSpace}
                  </span>
                </div>

                {problem.estimatedSolveTime && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-slate-500" /> ~{problem.estimatedSolveTime}
                  </span>
                )}
              </div>

              {/* Badges Grid */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
                {problem.primaryTopic && (
                  <span className="bg-violet-500/15 border border-violet-500/30 text-violet-200 px-2.5 py-0.5 rounded-lg font-semibold capitalize">
                    {problem.primaryTopic.replace(/-/g, ' ')}
                  </span>
                )}
                {problem.importance && (
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" /> Importance {problem.importance}
                  </span>
                )}
                {problem.interviewFrequency && (
                  <span className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {problem.interviewFrequency} Frequency
                  </span>
                )}
                {problem.pattern && (
                  <span className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2 py-0.5 rounded-lg font-semibold flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3 text-indigo-400" /> Pattern: {problem.pattern}
                  </span>
                )}
              </div>

              {/* Secondary Topics */}
              {problem.secondaryTopics && problem.secondaryTopics.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-400">
                  <span className="font-semibold text-slate-400 text-[11px]">Topics:</span>
                  <div className="flex flex-wrap gap-1">
                    {problem.secondaryTopics.map((top) => (
                      <span
                        key={top}
                        className="bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded text-[11px] capitalize"
                      >
                        {String(top).replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Companies */}
              {problem.companies && problem.companies.length > 0 && (
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-400 text-[11px]">Asked At:</span>
                  <div className="flex flex-wrap gap-1">
                    {problem.companies.slice(0, 6).map((comp) => (
                      <span
                        key={comp.slug}
                        className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]"
                      >
                        {comp.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Interactive 3-Step Problem Solving Pipeline Widget */}
            <div className="glass-card rounded-2xl p-4 border border-violet-500/20 bg-gradient-to-r from-violet-950/30 via-slate-900/50 to-slate-950/60 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-400" />
                  Structured Solving Pipeline
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Step {activeStep} of 3</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {/* Step 1 */}
                <button
                  onClick={() => setActiveStep(1)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden',
                    activeStep === 1
                      ? 'bg-violet-500/20 border-violet-400/50 text-white shadow-inner shadow-violet-400/10'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
                      Step 1
                    </span>
                    <Zap className="w-3 h-3 text-amber-400" />
                  </div>
                  <p className="font-bold text-[11px] truncate">Read Signal</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Identify clues & triggers</p>
                </button>

                {/* Step 2 */}
                <button
                  onClick={() => setActiveStep(2)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden',
                    activeStep === 2
                      ? 'bg-violet-500/20 border-violet-400/50 text-white shadow-inner shadow-violet-400/10'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      Step 2
                    </span>
                    <BrainCircuit className="w-3 h-3 text-indigo-400" />
                  </div>
                  <p className="font-bold text-[11px] truncate">State Invariant</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Formulate core rule</p>
                </button>

                {/* Step 3 */}
                <button
                  onClick={() => setActiveStep(3)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all relative overflow-hidden',
                    activeStep === 3
                      ? 'bg-violet-500/20 border-violet-400/50 text-white shadow-inner shadow-violet-400/10'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Step 3
                    </span>
                    <Code2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="font-bold text-[11px] truncate">Code Pattern</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">Write clean solution</p>
                </button>
              </div>

              {/* Active Step Context Box */}
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                {activeStep === 1 && (
                  <div>
                    <span className="font-bold text-violet-300 text-[11px]">
                      Signal Breakdown:
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      {problem.recognitionClues ||
                        `Analyze the problem constraints and trigger keywords (${problem.keywords?.join(
                          ', '
                        ) || 'patterns'}).`}
                    </p>
                  </div>
                )}
                {activeStep === 2 && (
                  <div>
                    <span className="font-bold text-indigo-300 text-[11px]">
                      Invariant Rule:
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      {problem.intuition ||
                        problem.approach ||
                        `Maintain the invariant property using ${
                          problem.pattern || 'the optimal pattern'
                        }.`}
                    </p>
                  </div>
                )}
                {activeStep === 3 && (
                  <div>
                    <span className="font-bold text-emerald-300 text-[11px]">
                      Implementation Focus:
                    </span>
                    <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                      Implement the starter template, handle edge cases, and run sample tests.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Pattern Signal Card */}
            {(problem.pattern || problem.recognitionClues) && (
              <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950/80 border border-indigo-500/20 rounded-2xl p-4 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Pattern Signal & Core Intuition
                  </h3>
                  {problem.pattern && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold">
                      {problem.pattern}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {problem.recognitionClues || problem.intuition}
                </p>
                {problem.keywords && problem.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Triggers:
                    </span>
                    {problem.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="bg-indigo-950/60 text-indigo-200 border border-indigo-800/40 px-2 py-0.5 rounded text-[10px] font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Special V2 Execution Driver Notice for 27 Review Problems */}
            {((problem as any).isV2Pending ||
              (problem as any).executionStatus === 'V2_PENDING' ||
              (problem as any).stdinStatus === 'REVIEW') && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200 shadow-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300">
                    Special Execution Driver Required (V2 Pending)
                  </h4>
                  <p className="text-amber-200/80 leading-relaxed">
                    This problem features specialized tree or design object structures. Problem
                    description, constraints, hints, and reference solutions are fully accessible for
                    study. Automated test execution for this problem will be enabled in V2 with
                    specialized drivers.
                  </p>
                </div>
              </div>
            )}

            {/* Problem Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Problem Description
              </h3>
              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
                {problem.description}
              </div>
            </div>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Examples
                </h3>
                <div className="space-y-2.5">
                  {problem.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1.5 text-xs font-mono"
                    >
                      <div className="flex justify-between text-slate-400 font-sans font-bold border-b border-slate-800/60 pb-1 text-[11px]">
                        <span>Example {idx + 1}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Input: </span>
                        <span className="text-slate-200">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Output: </span>
                        <span className="text-emerald-400 font-bold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-slate-400 font-sans text-[11px] pt-1">
                          <span className="font-semibold text-slate-300">Explanation: </span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && problem.constraints.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Constraints
                </h3>
                <ul className="space-y-1 text-xs font-mono text-slate-300 bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-xl">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dynamic Input Guide (stdin) */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  <span>Dynamic Input Guide (stdin)</span>
                </h3>
              </div>

              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-md">
                <div className="flex items-center justify-between bg-slate-950 px-3 py-2 border-b border-slate-800 text-xs">
                  <div className="flex gap-1 font-mono text-[11px]">
                    {(['cpp', 'python', 'java', 'javascript', 'typescript'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setGuideLang(lang)}
                        className={cn(
                          'px-2.5 py-1 rounded font-semibold uppercase transition-all',
                          guideLang === lang
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        )}
                      >
                        {lang === 'cpp'
                          ? 'C++'
                          : lang === 'python'
                          ? 'Python'
                          : lang === 'javascript'
                          ? 'JS'
                          : lang === 'typescript'
                          ? 'TS'
                          : 'Java'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopyGuideSnippet(currentGuideSnippet)}
                    className="flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg border border-violet-500/20 transition-colors"
                  >
                    {copiedSnippet ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSnippet ? 'Copied!' : 'Copy Snippet'}</span>
                  </button>
                </div>

                <div className="p-3.5 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-52 bg-slate-950/70">
                  <pre className="whitespace-pre">{currentGuideSnippet}</pre>
                </div>
              </div>
            </div>

            {/* Hints */}
            {problem.hints && problem.hints.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Hints ({problem.hints.length})
                </h3>
                <div className="space-y-2">
                  {problem.hints.map((hint, idx) => (
                    <details
                      key={idx}
                      className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden group"
                    >
                      <summary className="cursor-pointer p-3 text-xs font-bold text-slate-300 hover:text-white transition-colors flex justify-between items-center bg-slate-900/80">
                        <span>Hint {idx + 1}</span>
                        <span className="text-[10px] text-violet-400 font-mono group-open:hidden">
                          Click to reveal
                        </span>
                      </summary>
                      <div className="p-3 text-xs text-slate-300 border-t border-slate-800/80 bg-slate-950/60 leading-relaxed">
                        {hint}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: INTERVIEW LENS 🎙️ */}
        {/* ================================================================= */}
        {activeTab === 'interview-lens' && (
          <div className="space-y-5 text-xs text-slate-200">
            {/* Top Prompt Banner */}
            <div className="glass-card rounded-2xl p-5 border border-violet-500/30 bg-gradient-to-br from-violet-950/50 via-slate-900 to-slate-950 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-300 flex items-center gap-1.5">
                  <Mic2 className="w-4 h-4 text-violet-400 animate-pulse" />
                  Interviewer Communication Lens
                </span>
                <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 text-[10px] font-bold font-mono">
                  Live Verbalization Guide
                </span>
              </div>

              <h2 className="text-sm font-extrabold text-white">
                What to communicate out loud during your interview
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Top tier interviewers evaluate your thought structure and communication clarity as much as your code. Use this verbalization playbook during your technical round.
              </p>
            </div>

            {/* Step-by-step Interview Verbalization Playbook */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-violet-400" />
                Interview Talking Points
              </h3>

              {/* Point 1: Stating Approach */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-violet-300 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-[10px] text-violet-300 font-mono">
                    1
                  </span>
                  <span>Speak the Approach & Data Structure Selection</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed pl-7">
                  {problem.intuition ||
                    `"I recognize this problem aligns with ${
                      problem.pattern || 'the optimal pattern'
                    }. I'll use ${
                      problem.primaryTopic?.replace(/-/g, ' ') || 'the appropriate data structure'
                    } because it allows us to achieve ${targetTime} time complexity."`}
                </p>
              </div>

              {/* Point 2: Stating Invariants & Edge Cases */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-[10px] text-indigo-300 font-mono">
                    2
                  </span>
                  <span>State Invariants & Edge Cases First</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed pl-7">
                  {problem.commonMistakes && problem.commonMistakes.length > 0
                    ? `"Before writing code, I'll account for edge cases: ${problem.commonMistakes.join(
                        ', '
                      )}."`
                    : `"Before coding, I'll explicitly handle empty input, boundary constraints, and single-element edge cases."`}
                </p>
              </div>

              {/* Point 3: Pro Interview Tricks & Cleanup */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-[10px] text-emerald-300 font-mono">
                    3
                  </span>
                  <span>Pro Interviewer Tip</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed pl-7">
                  {problem.interviewTrick ||
                    `"Flush boundaries or use sentinel values to eliminate special cleanup logic and keep the implementation clean."`}
                </p>
              </div>
            </div>

            {/* Target Complexity Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Target Complexity Bounds
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950 border border-emerald-500/20 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Time</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-400">{targetTime}</span>
                </div>
                <div className="bg-slate-950 border border-sky-500/20 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Space</span>
                  <span className="text-sm font-extrabold font-mono text-sky-400">{targetSpace}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: EDITORIAL & NOTES */}
        {/* ================================================================= */}
        {activeTab === 'editorial' && (
          <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
            {problem.editorial ? (
              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl whitespace-pre-wrap font-sans space-y-3">
                <FormattedMarkdown content={problem.editorial} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-white">Intuition</h3>
                  <p>
                    {problem.intuition ||
                      'Break down the problem by identifying optimal sub-structures and invariant properties.'}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-white">Approach</h3>
                  <p>{problem.approach || 'Utilize standard algorithmic patterns.'}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: REFERENCE SOLUTION */}
        {/* ================================================================= */}
        {activeTab === 'solution' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-xl">
              <div>
                <span className="text-xs font-bold text-white block">Approved Reference Solution</span>
                <span className="text-[11px] text-slate-400">
                  Derived from verified DSA Master Sheet repository
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                  {(['cpp', 'python', 'java', 'javascript', 'typescript'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSolutionLang(lang)}
                      className={cn(
                        'px-2.5 py-1 rounded font-semibold uppercase transition-colors',
                        solutionLang === lang
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      )}
                    >
                      {lang === 'cpp'
                        ? 'C++'
                        : lang === 'python'
                        ? 'Python'
                        : lang === 'javascript'
                        ? 'JS'
                        : lang === 'typescript'
                        ? 'TS'
                        : 'Java'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleCopySolution(currentRefSolution)}
                  className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors"
                >
                  {copiedSolution ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSolution ? 'Copied!' : 'Copy Solution'}</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[550px]">
              <pre className="whitespace-pre">{currentRefSolution}</pre>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: AI TUTOR */}
        {/* ================================================================= */}
        {activeTab === 'ai-explain' && (
          <div className="h-full">
            <AiTutorView problem={problem} />
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: NOTES */}
        {/* ================================================================= */}
        {activeTab === 'notes' && (
          <div className="flex flex-col h-full space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Personal Revision Notes
            </h3>
            <textarea
              className="flex-1 w-full min-h-[220px] bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none font-mono"
              placeholder="Record edge cases, interview tricks, or your thoughts here..."
            />
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors">
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultInputSnippet(lang: string, problem: WorkspaceProblem): string {
  if (lang === 'python') {
    return `# Read input from standard input (stdin)
import sys

def main():
    input_data = sys.stdin.read().splitlines()
    if not input_data:
        return
    # Process solution and print result

if __name__ == "__main__":
    main()`;
  }
  if (lang === 'cpp') {
    return `// Read input from standard input (cin)
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input, compute solution, print to cout
    return 0;
}`;
  }
  if (lang === 'java') {
    return `// Read input from standard input (Scanner / BufferedReader)
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Scanner sc = new Scanner(System.in);
        // Process solution
    }
}`;
  }
  if (lang === 'javascript') {
    return `// Read input from standard input (fs.readFileSync)
const fs = require('fs');

const input = fs.readFileSync(0, 'utf8').trim();
// Process solution and console.log output`;
  }
  return `// Read input from standard input (fs.readFileSync)
import * as fs from 'fs';

const input: string = fs.readFileSync(0, 'utf8').trim();
// Process solution and console.log output`;
}

function AiTutorView({ problem }: { problem: WorkspaceProblem }) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I'm your PrepGenie DSA Tutor for **${problem.title}**. You can ask me for hints, intuition, complexity analysis, or edge case walk-throughs.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setInput('');
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const resp = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: problem.title,
          problemDescription: problem.description,
          topic: problem.primaryTopic,
          pattern: problem.pattern,
          userQuestion: userMsg,
          messages: updatedMessages,
          language: 'cpp',
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply || 'Here is the guidance.' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Regarding **${problem.title}**: Make sure to maintain the farthest reachable index invariant.`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `To solve **${problem.title}**, analyze the bounds and reachable indices carefully.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={cn(
              'p-3 rounded-xl max-w-[85%] leading-relaxed',
              m.role === 'user'
                ? 'ml-auto bg-violet-600 text-white'
                : 'mr-auto bg-slate-950 border border-slate-800 text-slate-200'
            )}
          >
            <FormattedMarkdown content={m.content} />
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${problem.title}...`}
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

function FormattedMarkdown({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 my-1.5 text-[11px] font-mono overflow-x-auto text-emerald-300"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-base font-bold text-white mt-3 mb-1.5">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-sm font-bold text-violet-300 mt-2.5 mb-1">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-xs font-bold text-slate-200 mt-2 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      elements.push(
        <li key={index} className="ml-3.5 list-disc my-0.5 text-slate-300 text-xs">
          {parseInline(line.trim().slice(2))}
        </li>
      );
    } else if (line.trim().length > 0) {
      elements.push(
        <p key={index} className="my-1 text-xs text-slate-300 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
}

function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="bg-slate-800 text-violet-300 px-1 py-0.5 rounded font-mono text-[10px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
