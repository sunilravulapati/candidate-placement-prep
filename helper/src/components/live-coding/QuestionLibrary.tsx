'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getPaginatedProblemsAction } from '@backend/features/liveCoding/actions';
import {
  Search,
  ChevronDown,
  CheckCircle2,
  Circle,
  Bookmark,
  Clock,
  Briefcase,
  X,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

// ── Filter options ─────────────────────────────────────────────────────────────
const DIFFICULTY_OPTIONS = ['', 'EASY', 'MEDIUM', 'HARD'] as const;
type Difficulty = (typeof DIFFICULTY_OPTIONS)[number];

const TOPIC_OPTIONS = [
  { label: 'All Topics', value: '' },
  { label: 'Arrays', value: 'arrays' },
  { label: 'Strings', value: 'strings' },
  { label: 'Linked List', value: 'linked-list' },
  { label: 'Stack', value: 'stack' },
  { label: 'Queue', value: 'queue' },
  { label: 'Trees', value: 'tree' },
  { label: 'Graphs', value: 'graph' },
  { label: 'Dynamic Programming', value: 'dp' },
  { label: 'Greedy', value: 'greedy' },
  { label: 'Backtracking', value: 'backtracking' },
  { label: 'Searching', value: 'searching' },
  { label: 'Sorting', value: 'sorting' },
];

const COMPANY_OPTIONS = [
  { label: 'All Companies', value: '' },
  { label: 'Amazon', value: 'amazon' },
  { label: 'Google', value: 'google' },
  { label: 'Microsoft', value: 'microsoft' },
  { label: 'Adobe', value: 'adobe' },
  { label: 'Flipkart', value: 'flipkart' },
  { label: 'Cisco', value: 'cisco' },
  { label: 'JPMC', value: 'jpmc' },
  { label: 'Goldman Sachs', value: 'goldman-sachs' },
];

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  HARD: 'text-rose-400',
};

// ── Page range helper ──────────────────────────────────────────────────────────
function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total);
  } else if (current >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function QuestionLibrary() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('');
  const [topic, setTopic] = useState('');
  const [company, setCompany] = useState('');

  const limit = 20;
  const [problems, setProblems] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, difficulty, topic, company]);

  // Fetch problems
  useEffect(() => {
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getPaginatedProblemsAction({
          page,
          limit,
          search: search || undefined,
          difficulty: difficulty || undefined,
          topic: topic || undefined,
          company: company || undefined,
        });
        setProblems(res.problems as Array<Record<string, unknown>>);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error('Failed to load problems', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [page, limit, search, difficulty, topic, company]);

  const clearFilter = useCallback((filter: 'difficulty' | 'topic' | 'company') => {
    if (filter === 'difficulty') setDifficulty('');
    if (filter === 'topic') setTopic('');
    if (filter === 'company') setCompany('');
  }, []);

  const hasActiveFilters = difficulty || topic || company;
  const pageRange = getPageRange(page, totalPages);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Problem Library</h1>
          <p className="text-slate-400 text-sm">
            {total > 0 ? `${total} problems` : 'Loading…'} — curated from top tech companies
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, topic, or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-xl py-2 pl-3 pr-8 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTY_OPTIONS.filter(Boolean).map((d) => (
                <option key={d} value={d}>{DIFFICULTY_LABELS[d]}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Topic filter */}
          <div className="relative">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-xl py-2 pl-3 pr-8 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {TOPIC_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Company filter */}
          <div className="relative">
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-xl py-2 pl-3 pr-8 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              {COMPANY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => { setDifficulty(''); setTopic(''); setCompany(''); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium hover:bg-rose-500/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {difficulty && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium">
                <Filter className="w-3 h-3" />
                {DIFFICULTY_LABELS[difficulty]}
                <button onClick={() => clearFilter('difficulty')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {topic && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium">
                <Filter className="w-3 h-3" />
                {TOPIC_OPTIONS.find((o) => o.value === topic)?.label ?? topic}
                <button onClick={() => clearFilter('topic')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
            {company && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium">
                <Briefcase className="w-3 h-3" />
                {COMPANY_OPTIONS.find((o) => o.value === company)?.label ?? company}
                <button onClick={() => clearFilter('company')} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-5 font-medium w-12 text-center">Status</th>
                  <th className="py-3 px-5 font-medium">Title</th>
                  <th className="py-3 px-5 font-medium">Difficulty</th>
                  <th className="py-3 px-5 font-medium">Acceptance</th>
                  <th className="py-3 px-5 font-medium">Topics</th>
                  <th className="py-3 px-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="py-4 px-5">
                          <div className="h-3 bg-slate-800 rounded-full w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : problems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Search className="w-10 h-10 text-slate-700" />
                        <p>No problems match your filters.</p>
                        <button
                          onClick={() => { setSearch(''); setDifficulty(''); setTopic(''); setCompany(''); }}
                          className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  problems.map((q, idx) => (
                    <tr
                      key={String(q.id ?? idx)}
                      className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    >
                      {/* Status */}
                      <td className="py-4 px-5 text-center">
                        {q.status === 'SOLVED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : q.status === 'ATTEMPTED' ? (
                          <Clock className="w-4 h-4 text-amber-500 mx-auto" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-700 mx-auto" />
                        )}
                      </td>

                      {/* Title */}
                      <td className="py-4 px-5">
                        <Link
                          href={`/dsa/workspace/${q.slug}`}
                          className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm"
                        >
                          {String(q.title)}
                        </Link>
                        {Array.isArray(q.companies) && q.companies.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Briefcase className="w-3 h-3 text-slate-600" />
                            <span className="text-xs text-slate-500 truncate max-w-[220px]">
                              {(q.companies as Array<{ name: string }>)
                                .slice(0, 3)
                                .map((c) => c.name)
                                .join(', ')}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Difficulty */}
                      <td className="py-4 px-5">
                        <span
                          className={cn(
                            'text-xs font-bold uppercase tracking-wider',
                            DIFFICULTY_COLORS[String(q.difficulty)] ?? 'text-slate-400'
                          )}
                        >
                          {String(q.difficulty)}
                        </span>
                      </td>

                      {/* Acceptance */}
                      <td className="py-4 px-5 text-slate-400 text-sm">
                        {q.acceptanceRate ? `${Number(q.acceptanceRate).toFixed(1)}%` : '—'}
                      </td>

                      {/* Topics */}
                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(q.topics) &&
                            (q.topics as Array<{ name: string }>)
                              .slice(0, 2)
                              .map((t, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 bg-slate-800 rounded-md text-xs text-slate-400 whitespace-nowrap"
                                >
                                  {t.name}
                                </span>
                              ))}
                          {Array.isArray(q.topics) && q.topics.length > 2 && (
                            <span className="px-2 py-0.5 text-xs text-slate-600">
                              +{q.topics.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <button
                          className={cn(
                            'p-1.5 rounded-md transition-colors',
                            q.isBookmarked
                              ? 'text-indigo-400 hover:text-indigo-300'
                              : 'text-slate-600 hover:text-slate-400'
                          )}
                          title={q.isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        >
                          <Bookmark className={cn('w-4 h-4', Boolean(q.isBookmarked) && 'fill-current')} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-400">
            <div>
              {total === 0
                ? 'No results'
                : `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                >
                  ← Prev
                </button>

                {pageRange.map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-600">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-medium transition-colors',
                        page === p
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                      )}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages || total === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
