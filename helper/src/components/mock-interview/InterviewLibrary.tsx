'use client';

// components/mock-interview/InterviewLibrary.tsx
// Interview library grid — browse all public templates.

import { useState, useEffect } from 'react';
import { Search, Filter, Library, Layers, Gauge, X } from 'lucide-react';
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

  const hasActiveFilters = typeFilter !== 'ALL' || diffFilter !== 'ALL' || search !== '';

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-xl space-y-4">
        {/* Search Row */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="library-search"
            type="text"
            placeholder="Search templates by role, topics, company style..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Groups Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 border-t border-slate-800/60">
          {/* Type Filter Group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5 shrink-0">
              <Layers className="w-3.5 h-3.5 text-violet-400" /> Track:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                    typeFilter === t
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30 border border-violet-500/30'
                      : 'bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {t === 'SYSTEM_DESIGN' ? 'System Design' : t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter Group */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 flex items-center gap-1.5 shrink-0">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" /> Difficulty:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                    diffFilter === d
                      ? 'bg-slate-700 text-white shadow-md border border-slate-600'
                      : 'bg-slate-950/50 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Filter Summary */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-violet-400" />
          <span>{loading ? 'Loading templates…' : `${filtered.length} of ${templates.length} templates available`}</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setTypeFilter('ALL');
              setDiffFilter('ALL');
              setSearch('');
            }}
            className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3 border border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
          <Filter className="w-8 h-8 text-slate-600" />
          <p className="text-sm font-medium text-slate-300">No templates match your filters.</p>
          <button 
            onClick={() => { setTypeFilter('ALL'); setDiffFilter('ALL'); setSearch(''); }} 
            className="text-xs font-semibold px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
