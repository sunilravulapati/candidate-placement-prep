'use client';

import { useState } from 'react';
import { Sparkles, Cpu, AlertTriangle, CheckCircle, ChevronRight, TrendingUp, Scissors, ArrowRight } from 'lucide-react';
import { analyzeResumeAction } from '@backend/features/resume/actions';
import { LoadingOverlay, LoadingPhase } from '../core/LoadingOverlay';

interface AnalysisTabProps {
  resume: any;
  onTailor: () => void;
}

const ANALYSIS_PHASES = [
  { id: 'extracting', label: 'Extracting Resume Text' },
  { id: 'analyzing', label: 'Analyzing with LLM Recruiter models' },
  { id: 'normalizing', label: 'Normalizing schema structures' },
  { id: 'scoring', label: 'Running programmatic ATS scorer' },
  { id: 'saving', label: 'Saving analysis to database' }
];

export default function AnalysisTab({ resume, onTailor }: AnalysisTabProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phase, setPhase] = useState<LoadingPhase | 'extracting' | 'analyzing' | 'normalizing' | 'scoring'>('idle');
  const [localLatest, setLocalLatest] = useState(resume.latestAnalysis);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const runStep = async (p: any, ms: number) => {
        setPhase(p);
        await new Promise(r => setTimeout(r, ms));
      };

      await runStep('extracting', 800);
      await runStep('analyzing', 2000);
      await runStep('normalizing', 800);
      await runStep('scoring', 800);
      await runStep('saving', 800);

      const response = await analyzeResumeAction(resume.id, true);
      if (response.success) {
        setLocalLatest({
          overallScore: response.overallScore,
          atsScore: response.atsScore,
          semanticScore: response.semanticScore,
          warnings: response.warnings,
          preservationScore: response.preservationScore,
          modelUsed: response.modelUsed,
          processingTime: response.processingTime,
          createdAt: response.createdAt || new Date(),
          promptVersion: response.promptVersion,
          analysis: response.analysis || {},
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Analysis failed');
    } finally {
      setPhase('idle');
      setIsProcessing(false);
    }
  };

  if (!localLatest) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-3xl bg-slate-900/50">
        <Cpu className="w-16 h-16 text-slate-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-200">No Analysis Found</h3>
        <p className="text-slate-400 mt-2 max-w-md">This resume has not been analyzed yet. Run the AI Recruiter pipeline to get your ATS and Semantic scores.</p>
        <button 
          onClick={handleAnalyze}
          className="mt-6 bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4" /> Start AI Analysis
        </button>
        {errorMsg && <p className="text-red-400 mt-4 text-sm">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {isProcessing && <LoadingOverlay phase={phase as any} phases={ANALYSIS_PHASES} title="Analyzing Resume" />}

      {/* Radial scores display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall score wheel */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden backdrop-blur-md">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall ATS Score</span>
          
          <div className="relative flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
              <circle 
                cx="56" cy="56" r="48" 
                stroke="url(#grad)" strokeWidth="8" fill="transparent" 
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - localLatest.overallScore / 100)}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-2xl font-black text-white">{localLatest.overallScore}</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-semibold">
            Out of 100 Ceiling
          </span>
        </div>

        {/* Programmatic sub-score */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 backdrop-blur-md">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Programmatic Check</span>
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
              <circle 
                cx="48" cy="48" r="40" 
                stroke="#818cf8" strokeWidth="6" fill="transparent" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - (localLatest.atsScore * 2) / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xl font-extrabold text-white">{localLatest.atsScore}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            Structure & Keywords (Max 50)
          </span>
        </div>

        {/* Semantic sub-score */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 backdrop-blur-md">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Semantic Evaluation</span>
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
              <circle 
                cx="48" cy="48" r="40" 
                stroke="#c084fc" strokeWidth="6" fill="transparent" 
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - (localLatest.semanticScore * 2) / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xl font-extrabold text-white">{localLatest.semanticScore}</span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            LLM Recruiter (Max 50)
          </span>
        </div>

      </div>

      {/* Brutally honest summary */}
      <div className="p-6 rounded-3xl border border-violet-500/10 bg-gradient-to-br from-violet-950/10 to-slate-950/80 backdrop-blur-md space-y-2 shadow-xl">
        <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Brutally Honest AI Recruiter Summary
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed italic">
          &quot;{localLatest.analysis?.summary || 'No summary generated.'}&quot;
        </p>
      </div>

      {/* Warnings Section (Amber) */}
      {localLatest.warnings && localLatest.warnings.length > 0 && (
        <div className="bg-amber-950/10 border border-amber-500/20 p-5 rounded-2xl space-y-3 backdrop-blur-md">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            Quality Warning Alerts ({localLatest.warnings.length})
          </h4>
          <ul className="space-y-1.5 text-xs text-amber-300/90 list-disc list-inside">
            {localLatest.warnings.map((w: string, idx: number) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths & Weaknesses / Improvements grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Strengths (Green) */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md shadow-lg">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <CheckCircle className="w-4 h-4" />
            Core Strengths Detected
          </h4>
          <ul className="space-y-3 text-xs text-slate-300">
            {localLatest.analysis?.strengths?.map((s: string, idx: number) => (
              <li key={idx} className="flex gap-2 items-start">
                <ChevronRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            )) || <p className="text-slate-500 italic">No strengths logged.</p>}
          </ul>
        </div>

        {/* Improvements / Suggestions (Amber) */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 backdrop-blur-md shadow-lg">
          <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4" />
            Actionable Improvement Gaps
          </h4>
          <ul className="space-y-3 text-xs text-slate-300">
            {localLatest.analysis?.improvements?.map((s: string, idx: number) => (
              <li key={idx} className="flex gap-2 items-start">
                <ChevronRight className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            )) || <p className="text-slate-500 italic">No suggestions logged.</p>}
          </ul>
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-6">
        <button 
          onClick={onTailor}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Scissors className="w-4 h-4" />
          Tailor This Resume
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={handleAnalyze}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Cpu className="w-4 h-4" />
          Re-analyze
        </button>
      </div>

    </div>
  );
}
