'use client';

import React, { useState } from 'react';
import { BookOpen, Lightbulb, History, Sparkles, FileText } from 'lucide-react';
import { cn } from './CodingWorkspace';

interface QuestionPanelProps {
  problem: any;
}

export default function QuestionPanel({ problem }: QuestionPanelProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'ai-explain' | 'notes' | 'submissions'>('description');
  
  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      <div className="flex border-b border-slate-800 bg-slate-900 px-2 pt-2">
        <button
          onClick={() => setActiveTab('description')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors",
            activeTab === 'description' ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <BookOpen className="w-4 h-4" /> Description
        </button>
        <button
          onClick={() => setActiveTab('editorial')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors",
            activeTab === 'editorial' ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <Lightbulb className="w-4 h-4" /> Editorial
        </button>
        <button
          onClick={() => setActiveTab('ai-explain')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors",
            activeTab === 'ai-explain' ? "border-indigo-500 text-indigo-300" : "border-transparent text-indigo-400/70 hover:text-indigo-300"
          )}
        >
          <Sparkles className="w-4 h-4" /> AI Explain
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors",
            activeTab === 'notes' ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <FileText className="w-4 h-4" /> Notes
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors",
            activeTab === 'submissions' ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
          )}
        >
          <History className="w-4 h-4" /> Submissions
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 prose prose-invert max-w-none">
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div dangerouslySetInnerHTML={{ __html: problem.description }} className="text-slate-300 leading-relaxed" />
            
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">Examples</h3>
              {problem.examples.map((ex: any, idx: number) => (
                <div key={idx} className="bg-slate-800/50 rounded-lg p-4 font-mono text-sm border border-slate-700/50">
                  <div className="text-slate-400 mb-1">Input: <span className="text-slate-200">{ex.input}</span></div>
                  <div className="text-slate-400">Output: <span className="text-emerald-400">{ex.output}</span></div>
                </div>
              ))}
            </div>

            {problem.hints && problem.hints.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" /> Hints
                </h3>
                {problem.hints.map((hint: string, idx: number) => (
                  <details key={idx} className="bg-slate-800/30 rounded-lg border border-slate-700/50">
                    <summary className="cursor-pointer p-3 text-slate-300 font-medium hover:text-white transition-colors">
                      Hint {idx + 1}
                    </summary>
                    <div className="p-3 pt-0 text-sm text-slate-400 border-t border-slate-700/50 mt-2">
                      {hint}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'editorial' && (
          <div className="text-slate-400 text-center py-12">
            <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Editorial is locked</h3>
            <p>Solve the problem first to view the editorial, or use PrepGenie Premium to unlock it now.</p>
          </div>
        )}

        {activeTab === 'ai-explain' && (
          <div className="text-slate-400 text-center py-12">
            <Sparkles className="w-12 h-12 text-indigo-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">AI Explanation</h3>
            <p className="max-w-md mx-auto mb-6">Need help understanding the problem? Our AI can break it down, explain the intuition, or walk you through the constraints step-by-step.</p>
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
              Explain Intuition
            </button>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-bold text-white mb-4">My Notes</h3>
            <textarea 
              className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Write down your thoughts, edge cases, or key takeaways here..."
            />
            <div className="flex justify-end mt-4">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
