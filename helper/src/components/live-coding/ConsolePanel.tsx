'use client';

import React from 'react';
import { Terminal, RefreshCw } from 'lucide-react';
import { ExecutionResult } from '@/features/live-coding/execution/ExecutionProvider';

export default function ConsolePanel({ result, isRunning }: { result?: ExecutionResult | null, isRunning?: boolean }) {
  if (isRunning) {
    return (
      <div className="p-4 h-full bg-[#1e1e1e] font-mono text-sm flex items-center justify-center">
        <div className="text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <span>Executing code...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4 h-full bg-[#1e1e1e] font-mono text-sm">
        <div className="flex items-center gap-2 text-slate-400 mb-4 border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4" />
          <span>Console</span>
        </div>
        <div className="text-slate-500">Run your code to see the output here...</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full bg-[#1e1e1e] font-mono text-sm overflow-y-auto">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4" />
          <span>Output</span>
        </div>
        <div className={`font-semibold ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
          {result.passed ? 'Accepted' : (result.errorType || 'Wrong Answer')}
        </div>
      </div>

      <div className="space-y-4">
        {result.stderr && (
          <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-lg">
            <div className="text-xs text-rose-500/70 mb-1 font-bold uppercase tracking-wider">Error Output</div>
            <pre className="text-rose-400 whitespace-pre-wrap">{result.stderr}</pre>
          </div>
        )}
        
        {result.stdout && (
          <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div className="text-xs text-slate-500 mb-1 font-bold uppercase tracking-wider">Standard Output</div>
            <pre className="text-slate-300 whitespace-pre-wrap">{result.stdout}</pre>
          </div>
        )}
        
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Runtime:</span>
            <span className="text-emerald-400 font-semibold">{result.executionTimeMs} ms</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Memory:</span>
            <span className="text-indigo-400 font-semibold">{(result.memoryBytes / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
