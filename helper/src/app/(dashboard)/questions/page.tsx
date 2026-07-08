// src/app/questions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import FilterBar from '@/components/FilterBar';
import QuestionCard from '@/components/QuestionCard';
import { Question } from '@/lib/questions';
import { getQuestionsAction } from '@backend/features/dsa/actions';
import { Brain, Code2 } from 'lucide-react';
import { SkeletonList } from '@/components/ui';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    status: 'all',
  });

  // Load questions using Server Action
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getQuestionsAction();
        const mapped: Question[] = data.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          category: q.category,
          difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
          status: (q.progress && q.progress[0]?.status) || 'not_started',
          timeEstimate: q.timeEstimate,
        }));
        setQuestions(mapped);
        setFilteredQuestions(mapped);
      } catch {
        // silently fail — empty state shown below
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle filtering
  useEffect(() => {
    let result = questions;
    
    if (filters.category !== 'all') {
      result = result.filter(q => q.category.toLowerCase() === filters.category.toLowerCase());
    }
    
    if (filters.difficulty !== 'all') {
      result = result.filter(q => q.difficulty === filters.difficulty);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(q => q.status === filters.status);
    }
    
    setFilteredQuestions(result);
  }, [filters, questions]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Introduction */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Code2 className="w-6 h-6 text-violet-400" />
            DSA & Tech Question Bank
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Practice handpicked questions from top tech organizations and improve your topic-wise mastery.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Questions Listing */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Questions</span>
          <span className="text-xs text-slate-500 font-medium">Found {filteredQuestions.length} matches</span>
        </div>

        {isLoading ? (
          <SkeletonList count={6} />
        ) : filteredQuestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-2xl border border-slate-900 p-8">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-slate-300 font-bold">No matches found</h4>
            <p className="text-slate-500 text-xs mt-1">Try resetting the drop-down filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
