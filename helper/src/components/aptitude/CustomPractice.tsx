// helper/src/components/aptitude/CustomPractice.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  BookA, 
  Brain, 
  BarChart, 
  HelpCircle, 
  Clock, 
  Zap, 
  Play, 
  ArrowLeft,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { createCustomSessionAction } from '@backend/features/aptitude/actions';

interface CustomPracticeProps {
  onBack: () => void;
  onStartSession: (session: any) => void;
}

const CATEGORY_ICONS = {
  quantitative: Calculator,
  logical: Brain,
  verbal: BookA,
  di: BarChart,
};

const CATEGORY_LABELS = {
  quantitative: 'Quantitative Aptitude',
  logical: 'Logical Reasoning',
  verbal: 'Verbal Ability',
  di: 'Data Interpretation',
};

// Hardcoded available topics mapping corresponding to files created
const TOPIC_DETAILS = {
  quantitative: [
    { id: 'percentages', name: 'Percentages' },
    { id: 'profit-loss', name: 'Profit & Loss' },
    { id: 'time-work', name: 'Time & Work' },
  ],
  logical: [
    { id: 'blood-relations', name: 'Blood Relations' },
    { id: 'puzzles', name: 'Puzzles' },
  ],
  verbal: [
    { id: 'vocabulary', name: 'Vocabulary' },
    { id: 'reading-comprehension', name: 'Reading Comprehension' },
  ],
  di: [
    { id: 'pie-chart', name: 'Pie Charts' },
    { id: 'tables', name: 'Tables' },
  ],
};

export default function CustomPractice({ onBack, onStartSession }: CustomPracticeProps) {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['percentages']);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD' | 'MIXED'>('MIXED');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timeLimitOption, setTimeLimitOption] = useState<string>('unlimited');
  const [customTime, setCustomTime] = useState<string>('20');
  const [mode, setMode] = useState<'practice' | 'test'>('practice');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleCategory = (category: string) => {
    const topics = TOPIC_DETAILS[category as keyof typeof TOPIC_DETAILS].map((t) => t.id);
    const allSelected = topics.every((t) => selectedTopics.includes(t));
    if (allSelected) {
      setSelectedTopics((prev) => prev.filter((t) => !topics.includes(t)));
    } else {
      setSelectedTopics((prev) => Array.from(new Set([...prev, ...topics])));
    }
  };

  const handleStart = async () => {
    if (selectedTopics.length === 0) {
      setError('Please select at least one topic to practice.');
      return;
    }

    setLoading(true);
    setError(null);

    let finalTimeLimit = 0;
    if (timeLimitOption !== 'unlimited') {
      const minutes = parseInt(timeLimitOption === 'custom' ? customTime : timeLimitOption, 10);
      if (isNaN(minutes) || minutes <= 0) {
        setError('Please enter a valid time limit.');
        setLoading(false);
        return;
      }
      finalTimeLimit = minutes * 60; // convert to seconds
    }

    try {
      const session = await createCustomSessionAction({
        topics: selectedTopics,
        difficulty,
        questionCount,
        timeLimit: finalTimeLimit,
        mode,
      });

      onStartSession(session);
    } catch (err: any) {
      setError(err.message || 'Failed to create practice session. Try selecting more topics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pt-2">
      {/* Back Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-inner"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Custom Practice Mode</h2>
          <p className="text-slate-400 text-xs">Configure your practice dashboard with specific topics, limits, and rules.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Topics */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 h-full">
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <ListFilter className="w-4 h-4 text-fuchsia-400" /> 1. Select Topics
            </h3>

            <div className="space-y-5">
              {(Object.keys(TOPIC_DETAILS) as Array<keyof typeof TOPIC_DETAILS>).map((cat) => {
                const CatIcon = CATEGORY_ICONS[cat];
                const catTopics = TOPIC_DETAILS[cat];
                const allChecked = catTopics.every((t) => selectedTopics.includes(t.id));
                const someChecked = catTopics.some((t) => selectedTopics.includes(t.id));

                return (
                  <div key={cat} className="space-y-2.5">
                    <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <CatIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-200">{CATEGORY_LABELS[cat]}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-lg border transition-all font-medium',
                          allChecked 
                            ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        )}
                      >
                        {allChecked ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catTopics.map((topic) => {
                        const isChecked = selectedTopics.includes(topic.id);
                        return (
                          <div
                            key={topic.id}
                            onClick={() => toggleTopic(topic.id)}
                            className={cn(
                              'p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between group',
                              isChecked
                                ? 'bg-slate-800/40 border-fuchsia-500/40 text-white shadow-md'
                                : 'bg-slate-950/20 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-300'
                            )}
                          >
                            <span className="text-xs font-medium">{topic.name}</span>
                            <div className={cn(
                              'w-4 h-4 rounded-md border flex items-center justify-center transition-all',
                              isChecked
                                ? 'bg-fuchsia-500 border-fuchsia-400 text-white'
                                : 'border-slate-700 group-hover:border-slate-500 bg-slate-900 shadow-inner'
                            )}>
                              {isChecked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Settings */}
        <div className="space-y-4">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5 flex flex-col justify-between h-full">
            <div className="space-y-5">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800/80">
                <Zap className="w-4 h-4 text-amber-400" /> 2. Round Parameters
              </h3>

              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'practice', title: 'Practice', desc: 'Instant solutions' },
                    { id: 'test', title: 'Test Mode', desc: 'Results at the end' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMode(m.id as 'practice' | 'test')}
                      className={cn(
                        'p-3 rounded-xl border cursor-pointer text-center transition-all flex flex-col justify-center items-center',
                        mode === m.id
                          ? 'bg-slate-800/60 border-amber-500/40 text-amber-400 shadow-md'
                          : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400 hover:border-slate-800'
                      )}
                    >
                      <span className="text-xs font-bold">{m.title}</span>
                      <span className="text-[9px] opacity-80 font-medium mt-0.5">{m.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['EASY', 'MEDIUM', 'HARD', 'MIXED'] as const).map((diff) => (
                    <div
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={cn(
                        'py-2 px-1 rounded-xl border cursor-pointer text-center text-xs font-bold transition-all',
                        difficulty === diff
                          ? 'bg-slate-800/60 border-slate-500 text-slate-200'
                          : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400 hover:border-slate-800'
                      )}
                    >
                      {diff === 'MIXED' ? 'Mixed' : diff.charAt(0) + diff.slice(1).toLowerCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questions Count</label>
                <div className="grid grid-cols-6 gap-1">
                  {[5, 10, 15, 20, 25, 30].map((count) => (
                    <div
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={cn(
                        'py-2 rounded-lg border cursor-pointer text-center text-xs font-bold transition-all',
                        questionCount === count
                          ? 'bg-slate-850 border-slate-600 text-white'
                          : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400'
                      )}
                    >
                      {count}
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Time Limit
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'unlimited', label: 'No Limit' },
                    { id: '15', label: '15 Min' },
                    { id: '30', label: '30 Min' },
                    { id: '45', label: '45 Min' },
                    { id: '60', label: '60 Min' },
                    { id: 'custom', label: 'Custom' },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setTimeLimitOption(opt.id)}
                      className={cn(
                        'py-2 rounded-xl border cursor-pointer text-center text-xs font-bold transition-all',
                        timeLimitOption === opt.id
                          ? 'bg-slate-800/60 border-slate-650 text-white'
                          : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400'
                      )}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>

                {timeLimitOption === 'custom' && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      min="1"
                      max="180"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-700 w-24 shadow-inner"
                      placeholder="Minutes"
                    />
                    <span className="text-slate-400 text-xs">Minutes</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading}
              className={cn(
                'w-full py-4 mt-6 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md active:scale-[0.98]',
                loading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-white text-black hover:bg-slate-200 hover:shadow-lg'
              )}
            >
              {loading ? (
                <>Generating Session...</>
              ) : (
                <>
                  Start Custom Session <Play className="w-4 h-4 fill-current text-black" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
