// helper/src/app/(dashboard)/resume-studio/page.tsx
'use client';

import { useState } from 'react';
import { Sparkles, Cpu, Layers, Gauge, FileCheck2, History } from 'lucide-react';
import LibraryTab from '../../../components/resume-studio/LibraryTab';
import AnalysisTab from '../../../components/resume-studio/AnalysisTab';
import TailoringTab from '../../../components/resume-studio/TailoringTab';
import VersionsTab from '../../../components/resume-studio/VersionsTab';
import HistoryTab from '../../../components/resume-studio/HistoryTab';
import { PageHeader } from '../../../components/ui/PageHeader';

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
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Header Banner */}
      <PageHeader
        title="Resume Studio"
        description="Upload, analyze, and tailor your resumes to beat Applicant Tracking Systems (ATS) and impress recruiters."
        icon={Sparkles}
        iconClassName="text-violet-400 animate-pulse"
        gradientFrom="from-violet-950/70"
        gradientVia="via-indigo-950/45"
        gradientTo="to-slate-900/45"
        borderColor="border-violet-500/20"
        glowColor="bg-violet-500/15"
        secondaryGlowColor="bg-indigo-500/10"
        actions={
          <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span>AI Orchestrated Pipeline</span>
          </div>
        }
      />

      {/* Workspace Tabs */}
      <div className="flex overflow-x-auto bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 w-full backdrop-blur-md no-scrollbar gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isDisabled = tab.requiresResume && !activeResume;
          const isActive = activeTab === tab.id;

          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ResumeStudioTab)}
              disabled={isDisabled}
              className={`flex-none px-6 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 ${
                isActive 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30 border border-violet-500/30' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
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
      <div className="min-h-[500px] pt-1">
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
