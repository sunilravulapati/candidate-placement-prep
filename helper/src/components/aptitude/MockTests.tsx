// helper/src/components/aptitude/MockTests.tsx
'use client';

import React, { useState } from 'react';
import { Target, Lock, Play, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { createCustomSessionAction } from '@backend/features/aptitude/actions';

interface MockTestsProps {
  onStartMockTest?: (session: any) => void;
}

const mixedTests = [
  { 
    id: 1, 
    name: 'TCS NQT Mock 1', 
    duration: '90 mins', 
    durationMinutes: 90, 
    questions: 30, 
    difficulty: 'MEDIUM' as const, 
    locked: false, 
    type: 'Company Specific',
    topics: ['number-system', 'percentages', 'profit-and-loss', 'series', 'blood-relations', 'coding-decoding', 'reading-comprehension', 'vocabulary']
  },
  { 
    id: 2, 
    name: 'Infosys Pseudo Code + Quant', 
    duration: '60 mins', 
    durationMinutes: 60, 
    questions: 25, 
    difficulty: 'HARD' as const, 
    locked: true, 
    type: 'Company Specific',
    topics: ['permutations-combinations', 'probability', 'syllogisms', 'data-sufficiency']
  },
  { 
    id: 3, 
    name: 'Accenture Cognitive Assessment', 
    duration: '90 mins', 
    durationMinutes: 90, 
    questions: 30, 
    difficulty: 'MEDIUM' as const, 
    locked: true, 
    type: 'Company Specific',
    topics: ['analogies', 'classification', 'cloze-test', 'sentence-correction']
  },
  { 
    id: 4, 
    name: 'Amazon Online Assessment', 
    duration: '120 mins', 
    durationMinutes: 120, 
    questions: 30, 
    difficulty: 'HARD' as const, 
    locked: true, 
    type: 'Company Specific',
    topics: ['time-and-work', 'speed-distance-time', 'critical-reasoning', 'seating-arrangement']
  },
  { 
    id: 5, 
    name: 'General Aptitude Mini-Test', 
    duration: '30 mins', 
    durationMinutes: 30, 
    questions: 15, 
    difficulty: 'EASY' as const, 
    locked: false, 
    type: 'General',
    topics: ['averages', 'ratios-proportions', 'series', 'grammar-usage']
  },
];

export default function MockTests({ onStartMockTest }: MockTestsProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartTest = async (test: typeof mixedTests[0]) => {
    if (test.locked || !onStartMockTest) return;
    setLoadingId(test.id);
    setError(null);

    try {
      const session = await createCustomSessionAction({
        topics: test.topics,
        difficulty: test.difficulty,
        questionCount: test.questions,
        timeLimit: test.durationMinutes * 60,
        mode: 'test',
      });
      onStartMockTest(session);
    } catch (err: any) {
      console.error('Failed to start mock test:', err);
      setError(err?.message || 'Failed to start mock test');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Mock Assessments</h2>
          <p className="text-xs text-slate-400 mt-1">Timed company-specific and general aptitude mock exams.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {mixedTests.map((test) => {
          const isLoading = loadingId === test.id;
          return (
            <div key={test.id} className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:bg-slate-900/80 transition-colors border border-slate-800">
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-xl border flex-shrink-0', test.locked ? 'bg-slate-900/50 border-slate-800 text-slate-600' : 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400')}>
                  {test.locked ? <Lock className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={cn('text-base font-bold mb-1', test.locked ? 'text-slate-400' : 'text-slate-200')}>{test.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.duration}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span>{test.questions} Questions</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="text-fuchsia-400">{test.type}</span>
                  </div>
                </div>
              </div>
              
              <button 
                type="button"
                disabled={test.locked || isLoading}
                onClick={() => handleStartTest(test)}
                className={cn(
                  'shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2',
                  test.locked 
                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' 
                    : 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-600/20 active:scale-[0.98]'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting...
                  </>
                ) : test.locked ? (
                  'Locked'
                ) : (
                  <>
                    Start Test <Play className="w-3.5 h-3.5 fill-current" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
