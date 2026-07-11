'use client';

import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Play, AlertCircle, Lightbulb, Sparkles, AlertTriangle, Target, Briefcase, Activity } from 'lucide-react';
import { cn } from './CodingWorkspace';

export default function AIReviewPanel() {
  const [isDetailed, setIsDetailed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateDetailed = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsDetailed(true);
    }, 2000);
  };

  const basicReview = {
    status: 'ACCEPTED',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    summary: 'Your solution passes all test cases.',
  };

  const detailedReview = {
    overall: 'Good approach, but missing edge cases.',
    score: 85,
    metrics: [
      { label: 'Correctness', value: '80%', color: 'text-amber-400', bg: 'bg-amber-400/20' },
      { label: 'Time', value: 'O(N)', color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
      { label: 'Space', value: 'O(N)', color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
      { label: 'Cleanliness', value: '95%', color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
    ],
    feedback: [
      { type: 'positive', text: 'Used a HashMap for O(1) lookups, achieving optimal O(N) time complexity.' },
      { type: 'improvement', text: 'Consider what happens if the input array has fewer than 2 elements.' },
      { type: 'improvement', text: 'Variable names could be more descriptive (e.g., `numMap` instead of `m`).' },
    ],
    companyReadiness: [
      { name: 'Google', score: 85 },
      { name: 'Amazon', score: 90 },
      { name: 'Meta', score: 88 }
    ]
  };

  return (
    <div className="p-6 h-full bg-[#1e1e1e] overflow-y-auto">
      
      {/* Basic Review Section - Always Visible */}
      <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold text-lg">{basicReview.status}</h3>
              <p className="text-slate-400 text-sm">{basicReview.summary}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Time Complexity</div>
            <div className="text-indigo-400 font-mono">{basicReview.timeComplexity}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Space Complexity</div>
            <div className="text-indigo-400 font-mono">{basicReview.spaceComplexity}</div>
          </div>
        </div>
      </div>

      {/* Detailed Review Section */}
      {!isDetailed ? (
        <div className="text-center p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-indigo-400" />
          </div>
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2">Want a Deep Dive?</h3>
          <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
            Get comprehensive feedback on edge cases, alternative solutions, code style, and company readiness.
          </p>
          <button 
            onClick={handleGenerateDetailed}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin" /> Generating Review...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Get Detailed AI Review</span>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {detailedReview.metrics.map((metric, idx) => (
              <div key={idx} className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-center items-center text-center">
                <div className="text-xs text-slate-400 mb-2 font-medium tracking-wide uppercase">{metric.label}</div>
                <div className={cn("text-2xl font-bold", metric.color)}>{metric.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" /> Detailed Feedback
            </h3>
            
            {detailedReview.feedback.map((item, idx) => (
              <div key={idx} className={cn(
                "p-4 rounded-xl flex gap-3 text-sm border",
                item.type === 'positive' 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-100" 
                  : "bg-amber-500/5 border-amber-500/20 text-amber-100"
              )}>
                <div className="shrink-0 mt-0.5">
                  {item.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="leading-relaxed">{item.text}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Company Readiness
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {detailedReview.companyReadiness.map((company, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center">
                  <div className="text-slate-300 font-medium mb-2">{company.name}</div>
                  <div className="text-xl font-bold text-emerald-400">{company.score}%</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
