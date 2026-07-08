'use client';

import React from 'react';
import { Target, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MatchVisualizationProps {
  matchData: any;
}

export function MatchVisualization({ matchData }: MatchVisualizationProps) {
  if (!matchData) return null;

  const overallMatch = Math.max(0, Math.min(100, Number(matchData.overallMatch) || 0));
  const missingSkills = Array.isArray(matchData.missingSkills) ? matchData.missingSkills : [];
  const matchingSkills = Array.isArray(matchData.matchingSkills) ? matchData.matchingSkills : [];

  const colorClasses: Record<string, { text: string; bg: string }> = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500' },
    indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-500' },
    violet: { text: 'text-violet-400', bg: 'bg-violet-500' },
    fuchsia: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500' },
    rose: { text: 'text-rose-400', bg: 'bg-rose-500' },
  };

  const scoreBars = [
    { label: 'ATS', score: matchData.atsMatch, color: 'emerald' },
    { label: 'Keywords', score: matchData.keywordMatch, color: 'indigo' },
    { label: 'Technical', score: matchData.technicalSkillsMatch, color: 'blue' },
    { label: 'Projects', score: matchData.projectsMatch, color: 'violet' },
    { label: 'Experience', score: matchData.experienceMatch, color: 'fuchsia' },
    { label: 'Education', score: matchData.educationMatch, color: 'cyan' },
    { label: 'Responsibilities', score: matchData.responsibilitiesMatch, color: 'amber' },
    { label: 'Soft Skills', score: matchData.softSkillsMatch, color: 'rose' },
  ].map((bar) => ({ ...bar, score: Math.max(0, Math.min(100, Number(bar.score) || 0)) }));

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 relative overflow-hidden">
      <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center">
        <Target className="w-5 h-5 mr-2 text-indigo-400" />
        Detailed Match Analysis
      </h2>
      
      <div className="flex flex-col gap-6 items-center mb-8">
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="85" className="stroke-slate-800" strokeWidth="12" fill="none" />
            <circle 
              cx="96" 
              cy="96" 
              r="85" 
              className={`transition-all duration-1000 ease-out ${overallMatch >= 80 ? 'stroke-emerald-500' : overallMatch >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'}`} 
              strokeWidth="12" 
              fill="none" 
              strokeDasharray="534" 
              strokeDashoffset={534 - (534 * overallMatch) / 100} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-white">{overallMatch}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Overall Match</span>
          </div>
        </div>
        
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scoreBars.map((bar, i) => (
            <div key={i} className="rounded-lg border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="flex items-center justify-between gap-3 text-sm mb-2">
                <span className="min-w-0 truncate text-slate-300 font-medium">{bar.label}</span>
                <span className={`shrink-0 tabular-nums font-semibold ${colorClasses[bar.color].text}`}>{bar.score}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${colorClasses[bar.color].bg}`}
                  style={{ width: `${bar.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
          <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Missing Skills ({missingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length === 0 ? (
              <span className="text-slate-500 text-sm">None found. Great job!</span>
            ) : (
              missingSkills.map((skill: string, i: number) => (
                <span key={i} className="px-2.5 py-1 bg-rose-500/10 text-rose-300 text-xs rounded-md border border-rose-500/20">
                  {skill}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Matching Skills ({matchingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {matchingSkills.map((skill: string, i: number) => (
              <span key={i} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-md border border-emerald-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
