'use client';

import { useState } from 'react';
import { Sparkles, Cpu, Layers, Gauge, FileCheck2, History } from 'lucide-react';
import LibraryTab from '../../../components/resume-studio/LibraryTab';
import AnalysisTab from '../../../components/resume-studio/AnalysisTab';
import TailoringTab from '../../../components/resume-studio/TailoringTab';
import VersionsTab from '../../../components/resume-studio/VersionsTab';
import HistoryTab from '../../../components/resume-studio/HistoryTab';

export type ResumeStudioTab = 'library' | 'analysis' | 'tailoring' | 'versions' | 'history';

export default function ResumeStudioPage() {
  const [activeTab, setActiveTab] = useState<ResumeStudioTab>('library');
  const [activeResume, setActiveResume] = useState<any | null>(null);

  // Tab definitions
  const TABS = [
    { id: 'library', label: 'Library', icon: Layers },
    { id: 'analysis', label: 'Analysis', icon: Gauge, requiresResume: true },
    { id: 'tailoring', label: 'Tailoring', icon: Sparkles, requiresResume: true },
    { id: 'versions', label: 'Versions', icon: FileCheck2, requiresResume: true },
    { id: 'history', label: 'History', icon: History, requiresResume: true },
  ];

  const handleSelectResume = (resume: any) => {
    setActiveResume(resume);
    setActiveTab('analysis'); // Default to analysis when a resume is selected
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100 pb-12">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-slate-900/30 border border-indigo-500/20 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
              Resume Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
              Upload, analyze, and tailor your resumes to beat the ATS.
            </p>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span>AI Orchestrated Pipeline</span>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex overflow-x-auto bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full backdrop-blur-md no-scrollbar">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isDisabled = tab.requiresResume && !activeResume;
          const isActive = activeTab === tab.id;

          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ResumeStudioTab)}
              disabled={isDisabled}
              className={`flex-none px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                isActive 
                  ? 'bg-violet-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              } ${isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-slate-400' : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'library' && (
          <LibraryTab onSelectResume={handleSelectResume} activeResumeId={activeResume?.id} />
        )}
        {activeTab === 'analysis' && activeResume && (
          <AnalysisTab resume={activeResume} onTailor={() => setActiveTab('tailoring')} />
        )}
        {activeTab === 'tailoring' && activeResume && (
          <TailoringTab resume={activeResume} onVersions={() => setActiveTab('versions')} />
        )}
        {activeTab === 'versions' && activeResume && (
          <VersionsTab resume={activeResume} />
        )}
        {activeTab === 'history' && activeResume && (
          <HistoryTab resume={activeResume} />
        )}
      </div>

    </div>
  );
}
