'use client';

import React from 'react';
import { Layout } from 'lucide-react';

interface SideBySideComparisonProps {
  resumeText: string;
  jdText: string;
  matchingSkills: string[];
  missingSkills: string[];
}

export function SideBySideComparison({ resumeText, jdText, matchingSkills, missingSkills }: SideBySideComparisonProps) {
  
  // A naive highlighting function that wraps found keywords in spans
  const highlightText = (text: string) => {
    if (!text) return null;
    let highlighted = text;
    
    // Process missing skills (highlight red/amber in JD)
    missingSkills.forEach(skill => {
      if (!skill || skill.length < 3) return; // avoid highlighting short generic words
      const regex = new RegExp(`\\b(${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="bg-rose-500/20 text-rose-300 font-semibold px-1 rounded">$1</span>');
    });

    // Process matching skills (highlight green in both)
    matchingSkills.forEach(skill => {
      if (!skill || skill.length < 3) return;
      const regex = new RegExp(`\\b(${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="bg-emerald-500/20 text-emerald-300 font-semibold px-1 rounded">$1</span>');
    });

    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-200 flex items-center">
          <Layout className="w-4 h-4 mr-2 text-indigo-400" />
          Side-by-Side Analysis
        </h2>
        <div className="flex space-x-3 text-xs font-medium">
          <span className="flex items-center text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> Matched</span>
          <span className="flex items-center text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" /> Missing</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        <div className="p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Your Resume</h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 h-96 overflow-y-auto custom-scrollbar whitespace-pre-wrap pr-2">
            {highlightText(resumeText)}
          </div>
        </div>
        
        <div className="p-6 bg-slate-950/20">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Job Description</h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 h-96 overflow-y-auto custom-scrollbar whitespace-pre-wrap pr-2">
            {highlightText(jdText)}
          </div>
        </div>
      </div>
    </div>
  );
}
