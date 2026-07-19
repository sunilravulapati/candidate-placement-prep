// helper/src/components/aptitude/PracticeWorkspace.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck, 
  Flag, 
  Clock, 
  BookOpen, 
  PenTool, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  XCircle,
  Save
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { upsertQuestionProgressAction, submitSessionResultsAction } from '@backend/features/aptitude/actions';

interface PracticeWorkspaceProps {
  session: {
    questions: any[];
    timeLimit: number;
    mode: 'practice' | 'test';
    topics: string[];
    difficulty: string;
  };
  onBack: () => void;
  onFinish: (results: any) => void;
}

export default function PracticeWorkspace({ session, onBack, onFinish }: PracticeWorkspaceProps) {
  const { questions, timeLimit, mode } = session;
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = questions[currentIndex];

  // Answers tracker: mapping question ID to chosen option
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.userAnswer) {
        initial[q.id] = q.userAnswer;
      }
    });
    return initial;
  });

  // State for bookmarking
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    questions.forEach((q) => {
      initial[q.id] = q.isBookmarked || false;
    });
    return initial;
  });

  // State for mark for review
  const [reviews, setReviews] = useState<Record<string, boolean>>({});

  // State for notes
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((q) => {
      initial[q.id] = q.notes || '';
    });
    return initial;
  });

  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  // Question level timing tracker (seconds spent on each question)
  const [questionTimers, setQuestionTimers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    questions.forEach((q) => {
      initial[q.id] = 0;
    });
    return initial;
  });

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if a question's options were clicked in Practice Mode to reveal answers
  const [revealed, setRevealed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    questions.forEach((q) => {
      initial[q.id] = !!q.userAnswer;
    });
    return initial;
  });

  // Tick timers
  useEffect(() => {
    timerRef.current = setInterval(() => {
      // 1. Session Timer
      if (timeLimit > 0) {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSubmit(true); // Auto submit on expiration
            return 0;
          }
          return prev - 1;
        });
      }
      setElapsedTime((prev) => prev + 1);

      // 2. Active Question Timer
      setQuestionTimers((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + 1,
      }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion.id, timeLimit]);

  // Handle select option
  const handleSelectOption = async (option: string) => {
    if (mode === 'practice' && revealed[currentQuestion.id]) {
      return; // In practice mode, lock option selection after reveal
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));

    if (mode === 'practice') {
      setRevealed((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
    }

    // Persist immediately to UserAptitudeProgress in DB (non-blocking)
    try {
      const isCorrect = option === currentQuestion.correctAnswer;
      await upsertQuestionProgressAction(currentQuestion.id, {
        status: isCorrect ? 'completed' : 'wrong',
        answer: option,
      });
    } catch (e) {
      console.error('Failed to save answer progress:', e);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    const nextVal = !bookmarks[currentQuestion.id];
    setBookmarks((prev) => ({ ...prev, [currentQuestion.id]: nextVal }));

    try {
      await upsertQuestionProgressAction(currentQuestion.id, {
        isBookmarked: nextVal,
      });
    } catch (e) {
      console.error('Failed to save bookmark status:', e);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    const text = notes[currentQuestion.id] || '';
    setSavingNotes((prev) => ({ ...prev, [currentQuestion.id]: true }));

    try {
      await upsertQuestionProgressAction(currentQuestion.id, {
        notes: text,
      });
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setSavingNotes((prev) => ({ ...prev, [currentQuestion.id]: false }));
    }
  };

  // Submit Session
  const handleSubmit = async (isTimeExpired = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const results = questions.map((q) => {
      const selected = answers[q.id] || '';
      return {
        questionId: q.id,
        submittedAnswer: selected,
        isCorrect: selected === q.correctAnswer,
        timeTaken: questionTimers[q.id] || 0,
      };
    });

    const score = results.filter((r) => r.isCorrect).length;
    const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
    const totalDuration = timeLimit > 0 ? (timeLimit - timeLeft) : elapsedTime;

    const payload = {
      mode,
      topics: session.topics,
      difficulty: session.difficulty as any,
      questionCount: questions.length,
      timeLimit: session.timeLimit,
      score,
      accuracy,
      timeTaken: totalDuration,
      results,
    };

    try {
      const savedSession = await submitSessionResultsAction(payload);
      onFinish({
        ...payload,
        id: savedSession.id,
        questions: questions.map((q) => ({
          ...q,
          userAnswer: answers[q.id] || null,
          isBookmarked: bookmarks[q.id] || false,
          notes: notes[q.id] || '',
        })),
      });
    } catch (e) {
      console.error('Failed to submit session results:', e);
      // Fallback: pass payload directly so the user is not blocked
      onFinish({
        ...payload,
        id: 'fallback_id',
        questions: questions.map((q) => ({
          ...q,
          userAnswer: answers[q.id] || null,
          isBookmarked: bookmarks[q.id] || false,
          notes: notes[q.id] || '',
        })),
      });
    }
  };

  // Helpers for timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatusClass = (idx: number) => {
    const qId = questions[idx].id;
    const isCurrent = idx === currentIndex;
    const isAnswered = !!answers[qId];
    const isFlagged = !!reviews[qId];

    if (isCurrent) return 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10 font-bold';
    if (isFlagged) return 'border-amber-500/40 text-amber-500 bg-amber-500/5';
    if (isAnswered) return 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5';
    return 'border-slate-800 text-slate-500 bg-slate-950/20 hover:border-slate-700 hover:text-slate-400';
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to exit? Your progress in this session will not be saved.')) {
                onBack();
              }
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all shadow-inner"
          >
            Exit Session
          </button>
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-850 border border-slate-800 text-slate-400">
              {mode === 'practice' ? 'Practice Mode' : 'Test Mode'}
            </span>
            <span className="text-slate-500 text-xs mx-2">|</span>
            <span className="text-slate-400 text-xs font-medium">
              Topic: {currentQuestion.topic.replace('-', ' ')}
            </span>
          </div>
        </div>

        {/* Timers & Actions */}
        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl shadow-inner text-slate-300 font-mono text-sm">
            <Clock className="w-4 h-4 text-fuchsia-400" />
            {timeLimit > 0 ? (
              <span className={cn(timeLeft < 60 ? 'text-rose-400 font-bold animate-pulse' : '')}>
                {formatTime(timeLeft)}
              </span>
            ) : (
              <span>{formatTime(elapsedTime)}</span>
            )}
          </div>

          <button
            onClick={() => handleSubmit(false)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition-colors shadow-md shadow-fuchsia-900/10"
          >
            Submit Session
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Question Workspace */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6 min-h-[400px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Question Header Info */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setReviews((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
                    className={cn(
                      'flex items-center gap-1 font-semibold transition-all px-2.5 py-1 rounded-lg border',
                      reviews[currentQuestion.id]
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-800'
                    )}
                  >
                    <Flag className="w-3.5 h-3.5" /> 
                    {reviews[currentQuestion.id] ? 'Flagged' : 'Mark for Review'}
                  </button>

                  <button
                    onClick={handleToggleBookmark}
                    className={cn(
                      'flex items-center gap-1 font-semibold transition-all px-2.5 py-1 rounded-lg border',
                      bookmarks[currentQuestion.id]
                        ? 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30'
                        : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-800'
                    )}
                  >
                    {bookmarks[currentQuestion.id] ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" /> Bookmarked
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" /> Bookmark
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Question Body */}
              <div className="space-y-4">
                <h4 className="text-base font-bold text-white leading-relaxed whitespace-pre-line">
                  {currentQuestion.description}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((option: string, oIdx: number) => {
                  const isSelected = answers[currentQuestion.id] === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const isRevealed = revealed[currentQuestion.id];

                  let optionClass = 'bg-slate-950/20 border-slate-900 hover:border-slate-800 text-slate-300';
                  if (isSelected) {
                    optionClass = 'bg-slate-850 border-fuchsia-500/60 text-white font-medium';
                  }

                  if (isRevealed && mode === 'practice') {
                    if (isCorrect) {
                      optionClass = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold';
                    } else if (isSelected) {
                      optionClass = 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold';
                    } else {
                      optionClass = 'bg-slate-950/20 border-slate-900 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(option)}
                      className={cn(
                        'p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between group',
                        optionClass
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          'w-6 h-6 text-[10px] font-bold rounded-lg border flex items-center justify-center transition-all shrink-0',
                          isSelected
                            ? 'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        )}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-xs">{option}</span>
                      </div>
                      
                      {isRevealed && mode === 'practice' && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {isRevealed && mode === 'practice' && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation Panel */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-800/80 mt-6">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex gap-2">
                {mode === 'practice' && revealed[currentQuestion.id] && (
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1 animate-pulse">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Explanation Unlocked
                  </span>
                )}
              </div>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={() => handleSubmit(false)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 transition-colors shadow-md shadow-fuchsia-900/10"
                >
                  Finish
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Explanation panel: Practice Mode only, after selection */}
          {mode === 'practice' && revealed[currentQuestion.id] && (
            <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/30 space-y-4 animate-fadeIn">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" /> Explanation & Solution
              </h4>
              <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-2xl border border-slate-900 shadow-inner">
                {currentQuestion.explanation}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Progress Grid & Notes */}
        <div className="space-y-4">
          {/* Question Grid */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={cn(
                    'h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all',
                    getQuestionStatusClass(idx)
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-medium border-t border-slate-800/40">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Answered</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Flagged</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700" /> Empty</span>
            </div>
          </div>

          {/* Notes Panel */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4 flex flex-col">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5" /> Scratch Notes
              </h3>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes[currentQuestion.id]}
                className="text-[10px] font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-900 border border-slate-800"
              >
                <Save className="w-3 h-3" />
                {savingNotes[currentQuestion.id] ? 'Saving...' : 'Save'}
              </button>
            </div>

            <textarea
              value={notes[currentQuestion.id] || ''}
              onChange={(e) => {
                const text = e.target.value;
                setNotes((prev) => ({ ...prev, [currentQuestion.id]: text }));
              }}
              placeholder="Jot down formulas, step-by-step logic, or calculations here..."
              rows={8}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-300 placeholder:text-slate-650 focus:outline-none focus:border-slate-700 resize-none shadow-inner leading-relaxed"
            />
            <p className="text-[10px] text-slate-500 italic mt-1 text-right">Notes are saved to the cloud per question.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
