'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from './CodingWorkspace';

export default function TestCasePanel() {
  const [activeTab, setActiveTab] = useState(0);

  const testCases = [
    { input: 'nums = [2,7,11,15], target = 9', target: '[0,1]', output: '[0,1]', passed: true, hidden: false },
    { input: 'nums = [3,2,4], target = 6', target: '[1,2]', output: '[1,2]', passed: true, hidden: false },
    { input: 'Hidden Test Case 1', target: 'Hidden', output: 'Hidden', passed: true, hidden: true },
    { input: 'Hidden Test Case 2', target: 'Hidden', output: 'Hidden', passed: false, hidden: true },
  ];

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex px-2 pt-2 border-b border-slate-800">
        {testCases.map((tc, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors relative",
              activeTab === idx ? "border-indigo-500 text-white" : "border-transparent text-slate-400 hover:text-slate-200"
            )}
          >
            {tc.hidden ? `Hidden ${idx + 1}` : `Case ${idx + 1}`}
            {tc.passed ? (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-2 right-2" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-2 right-2" />
            )}
          </button>
        ))}
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-colors ml-auto">
          + Custom Case
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {testCases[activeTab].hidden ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
            <AlertCircle className="w-12 h-12 text-slate-700" />
            <p>This is a hidden test case used for submission.</p>
            {!testCases[activeTab].passed && (
              <p className="text-rose-400 text-sm">Failed with Wrong Answer or TLE.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Input</label>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-300 border border-slate-800">
                {testCases[activeTab].input}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expected Output</label>
              <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm text-slate-300 border border-slate-800">
                {testCases[activeTab].target}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actual Output</label>
              <div className={cn(
                "rounded-lg p-3 font-mono text-sm border",
                testCases[activeTab].passed 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                {testCases[activeTab].output}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
