// helper/src/app/(dashboard)/aptitude/page.tsx
'use client';

import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { 
  Brain, 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  BarChart3, 
  History as HistoryIcon,
  Sparkles 
} from 'lucide-react';

import AptitudeDashboard from '../../../components/aptitude/Dashboard';
import QuestionLibrary from '../../../components/aptitude/QuestionLibrary';
import MockTests from '../../../components/aptitude/MockTests';
import Analytics from '../../../components/aptitude/Analytics';
import History from '../../../components/aptitude/History';

import CustomPractice from '../../../components/aptitude/CustomPractice';
import PracticeWorkspace from '../../../components/aptitude/PracticeWorkspace';
import ResultsScreen from '../../../components/aptitude/ResultsScreen';

export type AptitudeTab = 'dashboard' | 'practice' | 'mock_tests' | 'analytics' | 'history';
export type ViewState = 'tabs' | 'custom_practice' | 'workspace' | 'results';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'practice', label: 'Practice Library', icon: BookOpen },
  { id: 'mock_tests', label: 'Mock Tests', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'history', label: 'History', icon: HistoryIcon },
] as const;

export default function AptitudeModule() {
  const [activeTab, setActiveTab] = useState<AptitudeTab>('dashboard');
  const [viewState, setViewState] = useState<ViewState>('tabs');
  const [selectedSession, setSelectedSession] = useState<any>(null);

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {viewState === 'tabs' && (
        <>
          <PageHeader
            title="Aptitude Studio"
            description="Master foundational quantitative, logical, and verbal reasoning skills for top-tier technical placement drives."
            icon={Brain}
            iconClassName="text-fuchsia-400 animate-pulse"
            gradientFrom="from-fuchsia-950/70"
            gradientVia="via-violet-950/45"
            gradientTo="to-slate-900/45"
            borderColor="border-fuchsia-500/20"
            glowColor="bg-fuchsia-500/15"
            secondaryGlowColor="bg-violet-500/10"
            actions={
              <div className="flex items-center gap-2 bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-300 font-semibold text-xs px-4 py-2.5 rounded-xl backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span>Interactive Practice Engine</span>
              </div>
            }
          />

          {/* Workspace Tabs */}
          <div className="flex overflow-x-auto bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 w-full backdrop-blur-md no-scrollbar gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AptitudeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap min-w-[130px] ${
                    isActive
                      ? 'bg-fuchsia-600/20 text-fuchsia-300 shadow-md border border-fuchsia-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            {activeTab === 'dashboard' && (
              <AptitudeDashboard 
                onNavigate={(tab) => {
                  if (tab === 'practice') {
                    setViewState('custom_practice');
                  } else {
                    setActiveTab(tab as AptitudeTab);
                  }
                }} 
              />
            )}
            {activeTab === 'practice' && (
              <QuestionLibrary 
                onStartCustomPractice={() => setViewState('custom_practice')}
                onStartTopicPractice={(session) => {
                  setSelectedSession(session);
                  setViewState('workspace');
                }}
              />
            )}
            {activeTab === 'mock_tests' && (
              <MockTests 
                onStartMockTest={(session) => {
                  setSelectedSession(session);
                  setViewState('workspace');
                }}
              />
            )}
            {activeTab === 'analytics' && <Analytics />}
            {activeTab === 'history' && (
              <History 
                onReviewSession={(session) => {
                  setSelectedSession(session);
                  setViewState('results');
                }}
              />
            )}
          </div>
        </>
      )}

      {viewState === 'custom_practice' && (
        <CustomPractice 
          onBack={() => setViewState('tabs')}
          onStartSession={(session) => {
            setSelectedSession(session);
            setViewState('workspace');
          }}
        />
      )}

      {viewState === 'workspace' && (
        <PracticeWorkspace 
          session={selectedSession}
          onBack={() => setViewState('tabs')}
          onFinish={(results) => {
            setSelectedSession(results);
            setViewState('results');
          }}
        />
      )}

      {viewState === 'results' && (
        <ResultsScreen 
          results={selectedSession}
          onClose={() => {
            setViewState('tabs');
            setActiveTab('dashboard');
          }}
        />
      )}
    </div>
  );
}
