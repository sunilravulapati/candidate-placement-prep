'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, AlertCircle } from 'lucide-react';
import QuestionCard from './QuestionCard';
import AnswerEditor from './AnswerEditor';
import ProgressSidebar from './ProgressSidebar';
import { submitAnswerAction } from '@backend/features/mockInterview/actions';

interface SessionQuestion {
  id: string;
  questionText: string;
  category: string;
  difficulty: string;
  estimatedTimeSec: number;
  orderIndex: number;
  isFollowUp?: boolean;
  status: string;
  answer?: string | null;
}

interface InterviewRoomProps {
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
    isFollowUp?: boolean;
  };
  durationMinutes: number;
  topics: string[];
  startedAt: Date;
  onInterviewEnded: (summary: any) => void;
}

export function InterviewRoom({
  sessionId,
  planTitle,
  planTotalQuestions,
  planStages,
  planPersona,
  firstQuestion,
  durationMinutes,
  topics,
  startedAt,
  onInterviewEnded,
}: InterviewRoomProps) {
  const [questions, setQuestions] = useState<SessionQuestion[]>([
    { ...firstQuestion, isFollowUp: firstQuestion.isFollowUp || false, status: 'PENDING', answer: null },
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion);
  const [answerText, setAnswerText] = useState('');
  const [submittingText, setSubmittingText] = useState<string | undefined>();
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answeredTopics, setAnsweredTopics] = useState<string[]>([]);

  const currentQuestionNumber = questions.length;
  const historicalQuestions = questions.filter(q => q.status === 'ANSWERED' || q.status === 'SKIPPED');

  const handleEndInterview = useCallback(async (reason: 'completed' | 'abandoned') => {
    setIsEnding(true);
    setSubmittingText('Finalizing interview...');
    try {
      // In a full implementation, we'd call an endInterviewAction here.
      // For now, we simulate completion.
      setTimeout(() => {
        onInterviewEnded({ reason, questionsAnswered: historicalQuestions.length });
      }, 1000);
    } catch (err) {
      setError((err as Error).message);
      setIsEnding(false);
      setSubmittingText(undefined);
    }
  }, [historicalQuestions.length, onInterviewEnded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isEnding && !submittingText) {
        handleEndInterview('abandoned');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnding, submittingText, handleEndInterview]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retrySubmit = async (params: any, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await submitAnswerAction(params);
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || submittingText) return;

    setError(null);
    setSubmittingText('Evaluating Answer...');
    const submittedAnswer = answerText.trim();

    const timeouts: NodeJS.Timeout[] = [];
    try {
      timeouts.push(setTimeout(() => { if (!isEnding) setSubmittingText('Analyzing Reasoning...'); }, 800));
      timeouts.push(setTimeout(() => { if (!isEnding) setSubmittingText('Checking Technical Accuracy...'); }, 1600));
      timeouts.push(setTimeout(() => { if (!isEnding) setSubmittingText('Generating Follow-up...'); }, 2400));
      timeouts.push(setTimeout(() => { if (!isEnding) setSubmittingText('Preparing Next Question...'); }, 3200));

      const result = await retrySubmit({
        sessionId,
        questionId: currentQuestion.id,
        answerText: submittedAnswer,
      });

      if (!result) throw new Error("Failed to submit answer after retries.");

      // Update current question in history array
      setQuestions(prev =>
        prev.map(q =>
          q.id === currentQuestion.id ? { ...q, status: 'ANSWERED', answer: submittedAnswer } : q
        )
      );

      setAnsweredTopics(prev => {
        const cat = currentQuestion.category;
        return prev.includes(cat) ? prev : [...prev, cat];
      });

      if (result.shouldEnd) {
        await handleEndInterview('completed');
        return;
      }

      if (result.nextQuestion) {
        const nq = result.nextQuestion;
        const newQuestion: SessionQuestion = {
          id: nq.id,
          questionText: nq.questionText,
          category: nq.category,
          difficulty: nq.difficulty,
          estimatedTimeSec: nq.estimatedTimeSec,
          orderIndex: questions.length,
          isFollowUp: nq.isFollowUp,
          status: 'PENDING',
        };
        
        setQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestion(newQuestion);
        setAnswerText('');
        scrollToTop();
      } else {
        await handleEndInterview('completed');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to submit answer');
    } finally {
      timeouts.forEach(clearTimeout);
      if (!isEnding) setSubmittingText(undefined);
    }
  };

  const handleSkip = async () => {
    if (submittingText) return;
    setError(null);
    setSubmittingText('Skipping Question...');

    try {
      const result = await retrySubmit({
        sessionId,
        questionId: currentQuestion.id,
        answerText: '[SKIPPED]',
      });

      if (!result) throw new Error("Failed to skip question after retries.");

      setQuestions(prev =>
        prev.map(q =>
          q.id === currentQuestion.id ? { ...q, status: 'SKIPPED', answer: '[SKIPPED]' } : q
        )
      );

      if (result.shouldEnd) {
        await handleEndInterview('completed');
        return;
      }

      if (result.nextQuestion) {
        const nq = result.nextQuestion;
        const newQuestion: SessionQuestion = {
          id: nq.id,
          questionText: nq.questionText,
          category: nq.category,
          difficulty: nq.difficulty,
          estimatedTimeSec: nq.estimatedTimeSec,
          orderIndex: questions.length,
          isFollowUp: nq.isFollowUp,
          status: 'PENDING',
        };
        
        setQuestions(prev => [...prev, newQuestion]);
        setCurrentQuestion(newQuestion);
        setAnswerText('');
        scrollToTop();
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to skip question');
    } finally {
      if (!isEnding) setSubmittingText(undefined);
    }
  };

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-[#030712] p-4 lg:p-6">
      
      {/* Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-violet-400" />
            {planTitle}
          </h2>
          <p className="text-sm text-slate-500 mt-1">Interviewer: <span className="text-slate-300 font-medium">{planPersona}</span></p>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 max-w-[1400px] mx-auto w-full">
        
        {/* Left: Active Question + Editor + History Accordion (70%) */}
        <div className="lg:flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto pr-2 no-scrollbar pb-10">
          
          <div className="flex flex-col gap-4">
            <QuestionCard
              questionText={currentQuestion.questionText}
              category={currentQuestion.category}
              difficulty={currentQuestion.difficulty}
              estimatedTimeSec={currentQuestion.estimatedTimeSec}
              questionNumber={currentQuestionNumber}
              totalQuestions={Math.max(questions.length, planTotalQuestions)}
              isFollowUp={currentQuestion.isFollowUp || false}
              followUpTrigger={(currentQuestion as any).followUpTrigger}
            />

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <AnswerEditor
              value={answerText}
              onChange={setAnswerText}
              onSubmit={handleSubmitAnswer}
              onSkip={handleSkip}
              onEnd={() => handleEndInterview('abandoned')}
              submittingText={submittingText}
              disabled={isEnding}
              estimatedTimeSec={currentQuestion.estimatedTimeSec}
            />
          </div>

          {/* Conversation Timeline */}
          {historicalQuestions.length > 0 && (
            <div className="mt-8 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
              {historicalQuestions.map((q, idx) => {
                const isSkipped = q.status === 'SKIPPED';
                return (
                  <div key={q.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </div>
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-800/50 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                      <div className="flex flex-col gap-2">
                        <div className="text-[10px] font-bold text-violet-400/70 uppercase tracking-wider mb-1">Question</div>
                        <p className="text-sm text-slate-200 leading-relaxed">{q.questionText}</p>
                        
                        {!isSkipped && q.answer && (
                          <div className="mt-3">
                            <div className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1">Your Answer</div>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                              {q.answer}
                            </p>
                          </div>
                        )}
                        
                        {isSkipped && (
                          <div className="mt-3">
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">SKIPPED</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right: Progress Sidebar (30%) */}
        <div className="lg:w-[320px] shrink-0 h-full">
          <ProgressSidebar
            totalMinutes={durationMinutes}
            startedAt={startedAt}
            questions={questions}
            topics={topics}
            answeredTopics={answeredTopics}
            stages={planStages}
            onExpire={() => handleEndInterview('completed')}
          />
        </div>
      </div>
    </div>
  );
}
