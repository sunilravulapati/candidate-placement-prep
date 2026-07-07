'use client';

import React from 'react';
import { Target, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MatchVisualizationProps {
  matchData: any;
}

export function MatchVisualization({ matchData }: MatchVisualizationProps) {
  if (!matchData) return null;

  const scoreBars = [
    { label: 'ATS Match', score: matchData.atsMatch, color: 'emerald' },
    { label: 'Keyword Match', score: matchData.keywordMatch, color: 'indigo' },
    { label: 'Technical Skills', score: matchData.technicalSkillsMatch, color: 'blue' },
    { label: 'Projects', score: matchData.projectsMatch, color: 'violet' },
    { label: 'Experience', score: matchData.experienceMatch, color: 'fuchsia' },
    { label: 'Education', score: matchData.educationMatch, color: 'cyan' },
    { label: 'Responsibilities', score: matchData.responsibilitiesMatch, color: 'amber' },
    { label: 'Soft Skills', score: matchData.softSkillsMatch, color: 'rose' },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center">
        <Target className="w-5 h-5 mr-2 text-indigo-400" />
        Detailed Match Analysis
      </h2>
      
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8">
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="85" className="stroke-slate-800" strokeWidth="12" fill="none" />
            <circle 
              cx="96" 
              cy="96" 
              r="85" 
              className={`transition-all duration-1000 ease-out ${matchData.overallMatch >= 80 ? 'stroke-emerald-500' : matchData.overallMatch >= 60 ? 'stroke-amber-500' : 'stroke-rose-500'}`} 
              strokeWidth="12" 
              fill="none" 
              strokeDasharray="534" 
              strokeDashoffset={534 - (534 * matchData.overallMatch) / 100} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold text-white">{matchData.overallMatch}%</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Overall Match</span>
          </div>
        </div>
        
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          {scoreBars.map((bar, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-slate-300 font-medium">{bar.label}</span>
                <span className={`font-semibold text-${bar.color}-400`}>{bar.score}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 bg-${bar.color}-500 shadow-[0_0_10px_currentColor]`} 
                  style={{ width: `${bar.score}%`, color: `var(--tw-colors-${bar.color}-500)` }} 
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
            Missing Skills ({matchData.missingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchData.missingSkills.length === 0 ? (
              <span className="text-slate-500 text-sm">None found. Great job!</span>
            ) : (
              matchData.missingSkills.map((skill: string, i: number) => (
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
            Matching Skills ({matchData.matchingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
            {matchData.matchingSkills.map((skill: string, i: number) => (
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
