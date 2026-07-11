'use client';

// app/(dashboard)/mock-interviews/page.tsx
// Mock Interview Studio — main workspace page.
// Five tabs: Library | Start | Interview | Feedback | History
// Active session persists across tab switches.

import { useState, useEffect } from 'react';
import {
  Mic2, Library, PlayCircle, LayoutDashboard, Star, History,
  ChevronRight, Cpu, Sparkles
} from 'lucide-react';
import InterviewLibrary from '../../../components/mock-interview/InterviewLibrary';
import StartInterviewForm from '../../../components/mock-interview/StartInterviewForm';
import { InterviewRoom } from '@/components/mock-interview/InterviewRoom';
import FeedbackDashboard from '../../../components/mock-interview/FeedbackDashboard';
import InterviewHistoryList from '../../../components/mock-interview/InterviewHistoryList';
import LoadingPlanOverlay from '../../../components/mock-interview/LoadingPlanOverlay';
import { getInterviewSessionAction, getActiveSessionAction, endInterviewAction } from '@backend/features/mockInterview/actions';

export type MockInterviewTab = 'library' | 'start' | 'interview' | 'feedback' | 'history';

// Active session state (persists across tab switches)
interface ActiveSession {
  sessionId: string;
  planTitle: string;
  planTotalQuestions: number;
  planStages: Array<{ name: string; questionCount: number }>;
  planPersona: string;
  firstQuestion: {
    id: string;
    questionText: string;
    category: string;
    difficulty: string;
    estimatedTimeSec: number;
    orderIndex: number;
  };
  durationMinutes: number;
  topics: string[];
  startedAt: Date;
}

interface CompletedSession {
  sessionId: string;
  overallScore: number;
  dimensions: any;
  improvementTrend?: any;
  feedback?: any;
  questions?: any[];
  sessionInfo?: any;
}

const TABS = [
  { id: 'library', label: 'Library', icon: Library },
  { id: 'start', label: 'Start', icon: PlayCircle },
  { id: 'interview', label: 'Interview', icon: LayoutDashboard, requiresSession: true },
  { id: 'feedback', label: 'Feedback', icon: Star, requiresSession: true },
  { id: 'history', label: 'History', icon: History },
] as const;

export default function MockInterviewStudioPage() {
  const [activeTab, setActiveTab] = useState<MockInterviewTab>('library');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);
  const [prefillTemplateId, setPrefillTemplateId] = useState<string | undefined>();
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [recoveringSession, setRecoveringSession] = useState<any | null>(null);

  useEffect(() => {
    async function checkActive() {
      try {
        const session = await getActiveSessionAction();
        if (session) {
          setRecoveringSession(session);
        }
      } catch (err) {
        console.error('Failed to check active session', err);
      }
    }
    checkActive();
  }, []);

  useEffect(() => {
    const handleUnload = () => {
      if (activeSession && !completedSession) {
        endInterviewAction({ sessionId: activeSession.sessionId, reason: 'abandoned' }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [activeSession, completedSession]);

  const handleResume = () => {
    if (!recoveringSession) return;
    
    // Find the first question, or the currently active one
    const firstQ = recoveringSession.session.questions.find((q: any) => q.orderIndex === 0) || recoveringSession.session.questions[0];
    setActiveSession({
      sessionId: recoveringSession.session.id,
      planTitle: recoveringSession.session.planJson?.title || 'Recovered Interview',
      planTotalQuestions: recoveringSession.session.planJson?.totalQuestions || recoveringSession.session.questions.length,
      planStages: recoveringSession.session.planJson?.stages || [],
      planPersona: recoveringSession.session.persona?.name || 'Interviewer',
      firstQuestion: firstQ ? {
        id: firstQ.id,
        questionText: firstQ.questionText,
        category: firstQ.category,
        difficulty: firstQ.difficulty,
        estimatedTimeSec: firstQ.estimatedTimeSec || 120,
        orderIndex: firstQ.orderIndex,
      } : { id: 'dummy', questionText: '...', category: 'General', difficulty: 'Medium', estimatedTimeSec: 120, orderIndex: 0 },
      durationMinutes: recoveringSession.session.durationMinutes || 30,
      topics: recoveringSession.session.topics || [],
      startedAt: recoveringSession.session.startedAt ? new Date(recoveringSession.session.startedAt) : new Date(),
    });
    setRecoveringSession(null);
    setActiveTab('interview');
  };

  const handleRestart = async () => {
    if (recoveringSession) {
      await endInterviewAction({ sessionId: recoveringSession.session.id, reason: 'abandoned' }).catch(() => {});
    }
    setRecoveringSession(null);
  };

  // User selected a template from Library → go to Start tab with prefill
  const handleUseTemplate = (templateId: string) => {
    setPrefillTemplateId(templateId);
    setActiveTab('start');
  };

  // Interview started — AI has generated plan + first question
  const handleInterviewStarted = (result: any) => {
    setActiveSession({
      sessionId: result.sessionId,
      planTitle: result.plan.title,
      planTotalQuestions: result.plan.totalQuestions,
      planStages: result.plan.stages,
      planPersona: result.plan.persona,
      firstQuestion: result.firstQuestion,
      durationMinutes: result.durationMinutes || 30, // Fallback for safety, but orchestrated value should exist
      topics: [], // loaded from session
      startedAt: new Date(),
    });
    setActiveTab('interview');
  };

  // Interview ended — evaluation complete, go to Feedback
  const handleInterviewEnded = (summary: any) => {
    if (!activeSession) return;

    setCompletedSession({
      sessionId: summary.sessionId || activeSession.sessionId,
      overallScore: summary.score?.overallScore ?? 0,
      dimensions: summary.score?.dimensions ?? {},
      improvementTrend: summary.score?.improvementTrend,
      feedback: summary.feedback,
      questions: summary.evaluations,
      sessionInfo: {
        type: 'TECHNICAL',
        difficulty: 'MEDIUM',
        questionsAnswered: summary.questionsAnswered ?? 0,
        durationMinutes: activeSession.durationMinutes,
      },
    });
    setActiveTab('feedback');
  };

  // History → reopen a past session's feedback
  const handleViewFeedback = async (sessionId: string) => {
    try {
      const data = await getInterviewSessionAction(sessionId);
      if (data) {
        setCompletedSession({
          sessionId: data.session.id,
          overallScore: data.score?.overallScore ?? 0,
          dimensions: data.score?.dimensions ?? {},
          improvementTrend: data.score?.improvementTrend,
          feedback: data.feedback,
          questions: data.session.questions,
          sessionInfo: {
            type: data.session.type,
            difficulty: data.session.difficulty,
            targetRole: data.session.targetRole,
            targetCompany: data.session.targetCompany,
            durationMinutes: data.session.durationMinutes,
            questionsAnswered: data.questionsAnswered ?? 0,
          },
        });
        setActiveTab('feedback');
      }
    } catch (err) {
      console.error('Failed to load session', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100 pb-12">

      {/* Recovery Overlay */}
      {recoveringSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-2">Resume Interview?</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You have an in-progress interview session ({recoveringSession.session.type} - {recoveringSession.session.durationMinutes} min). Would you like to resume where you left off or discard it?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleResume} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-3 rounded-xl transition-colors">
                Resume Interview
              </button>
              <button onClick={handleRestart} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-colors">
                Discard & Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      <LoadingPlanOverlay isVisible={isGeneratingPlan} />

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-slate-900/30 border border-indigo-500/20 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-500/8 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Mic2 className="w-8 h-8 text-violet-400" />
              Interview Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
              AI-powered mock interviews with real-time follow-up questions, evaluation, and recruiter feedback.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeSession && (
              <div className="flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-300 font-semibold text-xs px-4 py-2.5 rounded-xl">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Session Active
              </div>
            )}
            <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>v1 Foundation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full backdrop-blur-md no-scrollbar">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const requiresSession = 'requiresSession' in tab && tab.requiresSession;
          const isDisabled = requiresSession && !activeSession && tab.id !== 'feedback';
          const isFeedbackDisabled = tab.id === 'feedback' && !completedSession && !activeSession;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => !isDisabled && !isFeedbackDisabled && setActiveTab(tab.id as MockInterviewTab)}
              disabled={isDisabled || isFeedbackDisabled}
              className={`flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              } ${isDisabled || isFeedbackDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-slate-400' : ''}`}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'interview' && activeSession && (
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">

        {activeTab === 'library' && (
          <InterviewLibrary onUseTemplate={handleUseTemplate} />
        )}

        {activeTab === 'start' && (
          <div className="py-4">
            <StartInterviewForm
              prefillTemplateId={prefillTemplateId}
              onInterviewStarted={handleInterviewStarted}
            />
          </div>
        )}

        {activeTab === 'interview' && activeSession && (
          <InterviewRoom
            sessionId={activeSession.sessionId}
            planTitle={activeSession.planTitle}
            planTotalQuestions={activeSession.planTotalQuestions}
            planStages={activeSession.planStages}
            planPersona={activeSession.planPersona}
            firstQuestion={activeSession.firstQuestion}
            durationMinutes={activeSession.durationMinutes}
            topics={activeSession.topics}
            startedAt={activeSession.startedAt}
            onInterviewEnded={handleInterviewEnded}
          />
        )}

        {activeTab === 'feedback' && completedSession && (
          <FeedbackDashboard
            overallScore={completedSession.overallScore}
            dimensions={completedSession.dimensions}
            improvementTrend={completedSession.improvementTrend}
            feedback={completedSession.feedback}
            questions={completedSession.questions}
            sessionInfo={completedSession.sessionInfo}
          />
        )}

        {activeTab === 'feedback' && !completedSession && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600 gap-3">
            <Star className="w-10 h-10 opacity-30" />
            <p className="text-sm">Complete an interview to see your feedback here.</p>
            <button onClick={() => setActiveTab('start')} className="text-xs text-violet-400 hover:text-violet-300">
              Start an Interview →
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <InterviewHistoryList onViewFeedback={handleViewFeedback} />
        )}
      </div>
    </div>
  );
}
