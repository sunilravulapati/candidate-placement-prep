// helper/src/components/aptitude/QuestionLibrary.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  BookA, 
  Target, 
  Brain, 
  BarChart, 
  ChevronRight, 
  Search, 
  Sliders, 
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { getAptitudeTopicsAction, getQuestionsForTopicAction } from '@backend/features/aptitude/actions';
import { ErrorCard } from '../ui/error-card';

interface QuestionLibraryProps {
  onStartCustomPractice: () => void;
  onStartTopicPractice: (session: any) => void;
}

const CATEGORY_ICONS = {
  quantitative: Calculator,
  logical: Brain,
  verbal: BookA,
  di: BarChart,
};

const CATEGORIES = [
  { id: 'quantitative', label: 'Quantitative Aptitude' },
  { id: 'logical', label: 'Logical Reasoning' },
  { id: 'verbal', label: 'Verbal Ability' },
  { id: 'di', label: 'Data Interpretation' },
] as const;

export default function QuestionLibrary({ onStartCustomPractice, onStartTopicPractice }: QuestionLibraryProps) {
  const [activeTab, setActiveTab] = useState<'quantitative' | 'logical' | 'verbal' | 'di'>('quantitative');
  const [searchQuery, setSearchQuery] = useState('');
  const [topicsData, setTopicsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAptitudeTopicsAction();
        setTopicsData(data);
      } catch (err: any) {
        console.error('Failed to load aptitude topics:', err);
        setError(err.message || 'Failed to load topic library.');
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, []);

  if (error) {
    return (
      <div className="pt-4 max-w-lg mx-auto">
        <ErrorCard 
          type="database" 
          message="Failed to load topic library. Restart your Next.js dev server if you just completed database migrations." 
          onRetry={() => {
            window.location.reload();
          }} 
        />
      </div>
    );
  }


  const handleStartTopic = async (category: string, topicId: string) => {
    setActionLoading(topicId);
    try {
      const questions = await getQuestionsForTopicAction(category, topicId);
      if (questions.length === 0) {
        alert('No questions available in this topic yet.');
        setActionLoading(null);
        return;
      }

      onStartTopicPractice({
        questions,
        timeLimit: 0, // unlimited
        mode: 'practice',
        topics: [topicId],
        difficulty: 'MIXED',
      });
    } catch (err) {
      console.error('Failed to start topic practice:', err);
      alert('Error loading topic questions.');
    } finally {
      setActionLoading(null);
    }
  };

  const getDifficultyColor = (progress: number) => {
    if (progress >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (progress >= 30) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-slate-800 text-slate-400 border-slate-700/50';
  };

  const activeTopics = topicsData?.[activeTab] || [];
  
  const filteredTopics = activeTopics.filter((t: any) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pt-2">
      {/* Custom practice launcher banner */}
      <div className="relative overflow-hidden p-6 rounded-3xl border border-fuchsia-500/20 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-indigo-500/10 to-transparent opacity-50 group-hover:opacity-80 transition-all duration-500" />
        <div className="relative z-10 space-y-2">
          <span className="px-2.5 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <Sparkles className="w-3 h-3" /> Practice Lab
          </span>
          <h3 className="text-lg font-bold text-white">Create Custom Practice Session</h3>
          <p className="text-slate-400 text-xs max-w-xl">
            Mix and match topics, configure timed mock tests, adjust difficulty, or enter full test mode to replicate placement drives.
          </p>
        </div>
        <button
          onClick={onStartCustomPractice}
          className="relative z-10 px-5 py-3 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-md shrink-0 w-full md:w-auto text-xs active:scale-[0.98]"
        >
          <Sliders className="w-4 h-4 text-black" /> Configure Custom Round
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-slate-800/80 pb-4">
        {/* Tabs */}
        <div className="flex overflow-x-auto p-1 bg-slate-950/40 border border-slate-850 rounded-2xl w-full sm:w-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={cn(
                  'px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-slate-800 text-fuchsia-400 border border-slate-700/50 shadow-sm shadow-black/10'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-700 shadow-inner"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="h-48 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
          <span>No topics matching your query.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {filteredTopics.map((topic: any) => {
            const TopicIcon = CATEGORY_ICONS[activeTab];
            const isSelectable = topic.isAvailable;

            return (
              <div
                key={topic.id}
                onClick={() => {
                  if (isSelectable && actionLoading === null) {
                    handleStartTopic(activeTab, topic.id);
                  }
                }}
                className={cn(
                  'glass-card p-5 rounded-3xl border transition-all flex flex-col justify-between h-full relative overflow-hidden group',
                  isSelectable
                    ? 'cursor-pointer hover:bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
                    : 'opacity-50 cursor-not-allowed border-slate-900'
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-4">
                  {/* Category and Available Tags */}
                  <div className="flex justify-between items-start">
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-inner text-slate-400 group-hover:text-white transition-colors">
                      <TopicIcon className="w-4 h-4" />
                    </div>

                    {isSelectable ? (
                      <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase', getDifficultyColor(topic.progress))}>
                        {topic.progress === 100 ? (
                          <span className="flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" /> Mastered</span>
                        ) : topic.progress > 0 ? (
                          `In Progress`
                        ) : (
                          'Not Started'
                        )}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-850 text-slate-500 tracking-wide uppercase flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      {isSelectable ? `${topic.totalQuestions} Curated Questions` : 'Expanding Question Bank'}
                    </p>
                  </div>
                </div>

                {/* Progress bar or fallback */}
                <div className="relative z-10 pt-5 mt-auto border-t border-slate-900/60 flex items-center justify-between">
                  {isSelectable ? (
                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                        <span>COMPLETED</span>
                        <span>{topic.solvedQuestions} / {topic.totalQuestions} ({topic.progress}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/80">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-700"
                          style={{ width: `${topic.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-medium italic">Unavailable</span>
                  )}

                  {isSelectable && actionLoading === topic.id ? (
                    <span className="text-[10px] text-fuchsia-400 font-bold ml-4 animate-pulse">Loading...</span>
                  ) : isSelectable ? (
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-fuchsia-400 transition-all ml-4 shrink-0" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
