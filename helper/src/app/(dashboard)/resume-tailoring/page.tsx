'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, Upload, RefreshCw, LayoutDashboard } from 'lucide-react';
import { ResumeSelector } from '../../../components/tailoring/ResumeSelector';
import { JdSelector } from '../../../components/tailoring/JdSelector';
import { MatchVisualization } from '../../../components/tailoring/MatchVisualization';
import { RecommendationList } from '../../../components/tailoring/RecommendationList';
import { SideBySideComparison } from '../../../components/tailoring/SideBySideComparison';
import { TailoringHistory } from '../../../components/tailoring/TailoringHistory';
import { LoadingOverlay, LoadingPhase } from '../../../components/tailoring/LoadingOverlay';
import { createTailoringSessionAction, getTailoringSessionByIdAction } from '@backend/features/resume/actions';

export default function ResumeTailoringDashboard() {
  const [activeResume, setActiveResume] = useState<any>(null);
  const [activeJdId, setActiveJdId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  
  const [phase, setPhase] = useState<LoadingPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'selector' | 'dashboard' | 'history'>('selector');

  const handleResumeSelect = (resume: any) => {
    setActiveResume(resume);
  };

  const handleJdAnalyzed = async (jdId: string, jdData: any) => {
    setActiveJdId(jdId);
    if (activeResume) {
      await runOrchestration(activeResume.id, jdId);
    }
  };

  const runOrchestration = async (resumeId: string, jdId: string) => {
    try {
      setError(null);
      setPhase('extracting_resume');
      
      // Simulate progressive loading while the monolithic backend action runs
      const phases: LoadingPhase[] = [
        'extracting_resume', 'extracting_jd', 'analyzing_resume', 'analyzing_jd', 
        'comparing', 'generating_recommendations', 'saving'
      ];
      let pIdx = 0;
      const interval = setInterval(() => {
        if (pIdx < phases.length - 2) {
          pIdx++;
          setPhase(phases[pIdx]);
        }
      }, 3000);

      const res = await createTailoringSessionAction(resumeId, jdId);
      
      clearInterval(interval);
      setPhase('saving');
      
      if (!res.success) throw new Error('Tailoring session failed');
      
      // Load the full session data from db to ensure consistency
      const fullSession = await getTailoringSessionByIdAction(res.sessionId);
      
      setSessionData(fullSession);
      setPhase('done');
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during tailoring.');
      setPhase('idle');
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    try {
      setPhase('extracting_resume'); // Just to show loader
      const session = await getTailoringSessionByIdAction(sessionId);
      setActiveResume(session.resume);
      setActiveJdId(session.jobDescriptionId);
      setSessionData(session);
      setPhase('done');
      setView('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
      setPhase('idle');
    }
  };

  return (
    <div className="p-8 max-w-[90rem] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative min-h-screen">
      <LoadingOverlay phase={phase} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-sm font-semibold mb-3 border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span>AI Resume Intelligence</span>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 tracking-tight">
            Tailoring Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-sm max-w-2xl">
            Compare your resume against job descriptions, identify critical gaps, and generate highly targeted recommendations to beat the ATS.
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setView('history')}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-colors shadow-lg ${view === 'history' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">History</span>
          </button>
          <button 
            onClick={() => { setView('selector'); setActiveResume(null); setActiveJdId(null); setSessionData(null); }}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-all shadow-lg ${view === 'selector' ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/25' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">New Session</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* View Router */}
      {view === 'history' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-200">Session History</h2>
          <TailoringHistory resumeId={activeResume?.id} onSelectSession={handleLoadSession} />
        </div>
      )}

      {view === 'selector' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-bold text-slate-200">Select Resume</h2>
            </div>
            <ResumeSelector onSelect={handleResumeSelect} selectedId={activeResume?.id || null} />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${activeResume ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>2</div>
              <h2 className={`text-xl font-bold ${activeResume ? 'text-slate-200' : 'text-slate-500'}`}>Provide Job Description</h2>
            </div>
            {activeResume ? (
              <JdSelector onAnalyzed={handleJdAnalyzed} />
            ) : (
              <div className="p-8 border border-slate-800 border-dashed rounded-xl flex items-center justify-center bg-slate-900/30">
                <p className="text-slate-500 text-sm">Please select a resume first.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'dashboard' && sessionData && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <MatchVisualization matchData={sessionData.matchDetails} />
            </div>
            
            <div className="lg:col-span-2">
              <RecommendationList recommendations={sessionData.recommendations} />
            </div>
          </div>
          
          <SideBySideComparison 
            resumeText={sessionData.resume?.jdText || 'Resume content loaded from PDF...'} 
            jdText={sessionData.jobDescription?.originalText || 'Job description content...'}
            matchingSkills={sessionData.matchingSkills}
            missingSkills={sessionData.missingSkills}
          />
        </div>
      )}
      
    </div>
  );
}
