'use client';

// components/mock-interview/InterviewLibrary.tsx
// Interview library grid — browse all public templates.

import { useState, useEffect } from 'react';
import { Search, Filter, Library, Loader2 } from 'lucide-react';
import InterviewCard from './InterviewCard';
import { listInterviewTemplatesAction } from '@backend/features/mockInterview/actions';

type Template = Awaited<ReturnType<typeof listInterviewTemplatesAction>>[number];

const TYPES = ['ALL', 'TECHNICAL', 'BEHAVIORAL', 'HR', 'SYSTEM_DESIGN', 'CUSTOM'];
const DIFFICULTIES = ['ALL', 'EASY', 'MEDIUM', 'HARD'];

interface InterviewLibraryProps {
  onUseTemplate: (templateId: string) => void;
}

export default function InterviewLibrary({ onUseTemplate }: InterviewLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [diffFilter, setDiffFilter] = useState('ALL');

  useEffect(() => {
    listInterviewTemplatesAction()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter(t => {
    const matchType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchDiff = diffFilter === 'ALL' || t.difficulty === diffFilter;
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.topics.some(tp => tp.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchDiff && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="library-search"
            type="text"
            placeholder="Search templates, topics…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                typeFilter === t
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {t === 'SYSTEM_DESIGN' ? 'System Design' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1.5 shrink-0">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                diffFilter === d
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Library className="w-4 h-4" />
        {loading ? 'Loading templates…' : `${filtered.length} of ${templates.length} templates`}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-3">
          <Filter className="w-8 h-8" />
          <p className="text-sm">No templates match your filters.</p>
          <button onClick={() => { setTypeFilter('ALL'); setDiffFilter('ALL'); setSearch(''); }} className="text-xs text-violet-400 hover:text-violet-300">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <InterviewCard
              key={t.id}
              {...t}
              onUseTemplate={onUseTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
