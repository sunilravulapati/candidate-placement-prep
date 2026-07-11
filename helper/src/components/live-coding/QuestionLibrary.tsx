'use client';

import React, { useState, useEffect } from 'react';
import { getPaginatedProblemsAction } from '@backend/features/liveCoding/actions';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  CheckCircle2, 
  Circle,
  Bookmark,
  Heart,
  Clock,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// We will load dynamically.

export default function QuestionLibrary() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [problems, setProblems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      setIsLoading(true);
      try {
        const res = await getPaginatedProblemsAction({ page, limit, search });
        setProblems(res.problems);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Failed to load problems", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchProblems();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const handleNext = () => setPage(p => Math.min(p + 1, totalPages));
  const handlePrev = () => setPage(p => Math.max(p - 1, 1));
  
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Problem Library</h1>
          <p className="text-slate-400">Curated problems from top tech companies to help you ace your interview.</p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search questions, companies, topics..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
              Difficulty <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
              Status <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
              <Filter className="w-4 h-4" /> Tags
            </button>
          </div>
        </div>

        {/* Question Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900 text-slate-400 text-sm">
                  <th className="py-4 px-6 font-medium w-12 text-center">Status</th>
                  <th className="py-4 px-6 font-medium w-1/3">Title</th>
                  <th className="py-4 px-6 font-medium">Difficulty</th>
                  <th className="py-4 px-6 font-medium">Acceptance</th>
                  <th className="py-4 px-6 font-medium">Topics</th>
                  <th className="py-4 px-6 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">Loading problems...</td>
                  </tr>
                ) : problems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">No problems found.</td>
                  </tr>
                ) : problems.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-6 text-center">
                      {q.status === 'Solved' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : q.status === 'Attempted' ? (
                        <Clock className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-700 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/dsa/workspace/${q.slug}`} className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                        {q.title}
                      </Link>
                      {q.companies && q.companies.length > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <Briefcase className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500 truncate max-w-[200px]">
                            {q.companies.map((c: any) => c.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        q.difficulty === 'EASY' ? 'text-emerald-400' : q.difficulty === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                      )}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-sm">
                      {q.acceptanceRate ? `${q.acceptanceRate}%` : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-2">
                        {q.topics && q.topics.slice(0, 2).map((topic: any, tIdx: number) => (
                          <span key={tIdx} className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 whitespace-nowrap">
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                      <button className="text-slate-500 hover:text-white transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-sm text-slate-400">
            <div>
              Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrev} disabled={page === 1} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors">Prev</button>
              <button onClick={handleNext} disabled={page === totalPages || total === 0} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
