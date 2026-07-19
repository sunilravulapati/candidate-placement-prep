// helper/src/app/(dashboard)/aptitude/page.tsx
'use client';

import { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Brain } from 'lucide-react';

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

export default function AptitudeModule() {
  const [activeTab, setActiveTab] = useState<AptitudeTab>('dashboard');
  const [viewState, setViewState] = useState<ViewState>('tabs');
  const [selectedSession, setSelectedSession] = useState<any>(null);

  return (
    <>
      {viewState === 'tabs' && (
        <>
          <PageHeader
            title="Aptitude Studio"
            description="Master foundational math and verbal skills to crack top tier technical interviews."
            icon={Brain}
            iconClassName="text-fuchsia-400"
            gradientFrom="from-fuchsia-900/40"
            gradientVia="via-violet-900/30"
            gradientTo="to-slate-900/20"
            borderColor="border-fuchsia-500/10"
            glowColor="bg-fuchsia-500/10"
          />

          {/* Workspace Tabs */}
          <div className="flex overflow-x-auto bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full backdrop-blur-md no-scrollbar">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'practice', label: 'Practice Library' },
              { id: 'mock_tests', label: 'Mock Tests' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'history', label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AptitudeTab)}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap min-w-[120px] ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-fuchsia-400 shadow-md shadow-black/20 border border-slate-700/50'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
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
            {activeTab === 'mock_tests' && <MockTests />}
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
    </>
  );
}
