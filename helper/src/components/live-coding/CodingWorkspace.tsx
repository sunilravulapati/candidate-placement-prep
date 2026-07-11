'use client';

import React, { useState } from 'react';
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import QuestionPanel from './QuestionPanel';
import EditorPanel from './EditorPanel';
import ConsolePanel from './ConsolePanel';
import TestCasePanel from './TestCasePanel';
import AIReviewPanel from './AIReviewPanel';
  import { ArrowLeft, Play, Send } from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MockExecutionProvider } from '@/features/live-coding/execution/MockExecutionProvider';
import { ExecutionResult } from '@/features/live-coding/execution/ExecutionProvider';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CodingWorkspace({ sessionId: _sessionId }: { sessionId: string }) {
  const [activeBottomTab, setActiveBottomTab] = useState<'console' | 'testcases' | 'review'>('testcases');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState('');
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  
  // Dummy problem data
  const problem = {
    title: '1. Two Sum',
    difficulty: 'Easy',
    description: '<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    hints: ['A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it\'s best to try out brute force solutions for just for completeness.', 'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter.'],
  };

  const executionProvider = new MockExecutionProvider();

  const handleRunCode = async () => {
    setActiveBottomTab('console');
    setIsRunning(true);
    try {
      const res = await executionProvider.runTestCases({
        code,
        language: 'typescript',
        testCases: problem.examples.map(ex => ({ input: ex.input, expectedOutput: ex.output }))
      });
      setExecutionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setActiveBottomTab('console');
    try {
      const res = await executionProvider.runCode({
        code,
        language: 'typescript',
      });
      setExecutionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      // setActiveBottomTab('review');
    }
  };

  return (
    <div 
      className="flex flex-col bg-[#0A0A0B] text-slate-200 -mx-4 -mt-4 -mb-4 md:-mx-6 md:-mt-6 md:-mb-6 lg:-mx-8 lg:-mt-8 lg:-mb-8" 
      style={{ height: 'calc(100vh - 65px)' }}
    >
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/dsa/library" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">{problem.title}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunCode}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium"
          >
            <Play className="w-4 h-4 text-emerald-400" /> Run
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup orientation="horizontal" id="coding-workspace-layout">
          {/* Left Panel - Question Details */}
          <Panel defaultSize={35} minSize={20} className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden flex flex-col mr-1">
            <QuestionPanel problem={problem} />
          </Panel>

          <PanelResizeHandle className="w-2 hover:bg-indigo-500/50 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="w-0.5 h-8 bg-slate-700 rounded-full" />
          </PanelResizeHandle>

          {/* Right Panel - Editor & Console */}
          <Panel defaultSize={65} minSize={30} className="ml-1 flex flex-col">
            <PanelGroup orientation="vertical" id="coding-workspace-vertical-layout">
              <Panel defaultSize={70} minSize={20} className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden mb-1 flex flex-col relative">
                <EditorPanel code={code} onChange={setCode} onRun={handleRunCode} onSubmit={handleSubmit} />
              </Panel>

              <PanelResizeHandle className="h-2 hover:bg-indigo-500/50 transition-colors cursor-row-resize flex items-center justify-center">
                <div className="w-8 h-0.5 bg-slate-700 rounded-full" />
              </PanelResizeHandle>

              <Panel defaultSize={30} minSize={10} className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden mt-1 flex flex-col relative">
                
                {/* Bottom Panel Header */}
                <div className="flex items-center gap-1 border-b border-slate-800 px-2 py-1 bg-slate-900">
                  <button 
                    onClick={() => setActiveBottomTab('testcases')}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      activeBottomTab === 'testcases' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                  >
                    Test Cases
                  </button>
                  <button 
                    onClick={() => setActiveBottomTab('console')}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      activeBottomTab === 'console' ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                  >
                    Console
                  </button>
                  <button 
                    onClick={() => setActiveBottomTab('review')}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                      activeBottomTab === 'review' ? "bg-indigo-500/20 text-indigo-300" : "text-indigo-400/70 hover:text-indigo-300 hover:bg-indigo-500/10"
                    )}
                  >
                    AI Review
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {activeBottomTab === 'console' && <ConsolePanel result={executionResult} isRunning={isRunning || isSubmitting} />}
                  {activeBottomTab === 'testcases' && <TestCasePanel />}
                  {activeBottomTab === 'review' && <AIReviewPanel />}
                </div>

              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
