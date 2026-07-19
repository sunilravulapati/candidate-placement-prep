// helper/src/components/aptitude/ResultsScreen.tsx
'use client';

import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  BookmarkCheck, 
  Save, 
  BookOpen, 
  Sparkles,
  RefreshCcw,
  ListFilter
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { upsertQuestionProgressAction } from '@backend/features/aptitude/actions';

interface ResultsScreenProps {
  results: {
    mode: 'practice' | 'test';
    topics: string[];
    difficulty: string;
    questionCount: number;
    score: number;
    accuracy: number;
    timeTaken: number;
    results: any[];
    questions: any[];
  };
  onClose: () => void;
}

export default function ResultsScreen({ results, onClose }: ResultsScreenProps) {
  const { score, questionCount, accuracy, timeTaken, questions } = results;
  const [reviewIndex, setReviewIndex] = useState(0);
  const currentQuestion = questions[reviewIndex];

  // State for bookmarking
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    questions.forEach((q) => {
      initial[q.id] = q.isBookmarked || false;
    });
    return initial;
  });

  // State for notes
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    questions.forEach((q) => {
      initial[q.id] = q.notes || '';
    });
    return initial;
  });

  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatAvgTime = (seconds: number) => {
    return `${seconds}s`;
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (qId: string) => {
    const nextVal = !bookmarks[qId];
    setBookmarks((prev) => ({ ...prev, [qId]: nextVal }));

    try {
      await upsertQuestionProgressAction(qId, {
        isBookmarked: nextVal,
      });
    } catch (e) {
      console.error('Failed to save bookmark status:', e);
    }
  };

  // Save Notes
  const handleSaveNotes = async (qId: string) => {
    const text = notes[qId] || '';
    setSavingNotes((prev) => ({ ...prev, [qId]: true }));

    try {
      await upsertQuestionProgressAction(qId, {
        notes: text,
      });
    } catch (e) {
      console.error('Failed to save notes:', e);
    } finally {
      setSavingNotes((prev) => ({ ...prev, [qId]: false }));
    }
  };

  // Find incorrect topics
  const incorrectTopics = Array.from(
    new Set(
      results.results
        .filter((r) => !r.isCorrect)
        .map((r) => {
          const q = questions.find((ques) => ques.id === r.questionId);
          return q ? q.topic : '';
        })
        .filter(Boolean)
    )
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-2">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800/85">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-400 hover:text-white transition-all shadow-inner"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Session Review</h2>
            <p className="text-slate-400 text-xs">Review correct answers, explanations, and formulate shortcuts.</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors text-xs font-semibold"
        >
          Go to Dashboard
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Score */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-3">
            <div className="p-2.5 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 w-fit">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Score</p>
              <h3 className="text-2xl font-bold text-slate-100">
                {score} <span className="text-sm font-semibold text-slate-500">/ {questionCount}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Accuracy</p>
              <h3 className="text-2xl font-bold text-slate-100">{accuracy}%</h3>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Time Taken</p>
              <h3 className="text-2xl font-bold text-slate-100">{formatTime(timeTaken)}</h3>
            </div>
          </div>
        </div>

        {/* Average Time per Question */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg Time / Q</p>
              <h3 className="text-2xl font-bold text-slate-100">
                {formatAvgTime(questionCount > 0 ? Math.round(timeTaken / questionCount) : 0)}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Questions and Review Workspace */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Question Review Panel */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400">
                Reviewing Question {reviewIndex + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleBookmark(currentQuestion.id)}
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

            {/* Question Text */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white leading-relaxed whitespace-pre-line">
                {currentQuestion.description}
              </h4>
            </div>

            {/* Options list showing Correct / Incorrect choices */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((option: string, oIdx: number) => {
                const isSelected = currentQuestion.userAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;

                let optionClass = 'bg-slate-950/20 border-slate-900 text-slate-400 opacity-60';
                if (isCorrect) {
                  optionClass = 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold';
                } else if (isSelected) {
                  optionClass = 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold';
                }

                return (
                  <div
                    key={oIdx}
                    className={cn(
                      'p-4 rounded-xl border flex items-center justify-between transition-all text-xs',
                      optionClass
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 text-[10px] font-bold rounded-lg border flex items-center justify-center',
                        isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : isSelected
                            ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                            : 'bg-slate-900 border-slate-800 text-slate-500'
                      )}>
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400" />}
                  </div>
                );
              })}
            </div>

            {/* Explanation box */}
            <div className="space-y-3 pt-4 border-t border-slate-850">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Explanation
              </h4>
              <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-2xl border border-slate-900/60 shadow-inner">
                {currentQuestion.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator & Recommendations */}
        <div className="space-y-4">
          {/* Review Navigator Grid */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions Grid</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isSelected = idx === reviewIndex;
                const isCorrect = currentQuestion?.userAnswer === q.correctAnswer; // Wait, correct check on index specific q:
                const qIsCorrect = q.userAnswer === q.correctAnswer;
                const qIsSkipped = !q.userAnswer;

                return (
                  <button
                    key={idx}
                    onClick={() => setReviewIndex(idx)}
                    className={cn(
                      'h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all',
                      isSelected
                        ? 'border-fuchsia-500 text-fuchsia-400 bg-fuchsia-500/10 font-bold'
                        : qIsSkipped
                          ? 'border-slate-800 text-slate-500 bg-slate-950/20'
                          : qIsCorrect
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                            : 'border-rose-500/30 text-rose-400 bg-rose-500/5'
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 font-medium border-t border-slate-800/40">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Correct</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Incorrect</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700" /> Unanswered</span>
            </div>
          </div>

          {/* Notes for current question */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scratchpad</h3>
              <button
                onClick={() => handleSaveNotes(currentQuestion.id)}
                disabled={savingNotes[currentQuestion.id]}
                className="text-[10px] font-bold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
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
              placeholder="Edit your notes for this question..."
              rows={4}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-xs text-slate-350 focus:outline-none focus:border-slate-800 resize-none shadow-inner"
            />
          </div>

          {/* Recommended Topics */}
          {incorrectTopics.length > 0 && (
            <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3 bg-indigo-950/10">
              <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Recommended Practice
              </h3>
              <p className="text-[10px] text-slate-400">Based on your weak points in this session, revise these modules:</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {incorrectTopics.map((topic) => (
                  <span
                    key={topic}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize"
                  >
                    {topic.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
