'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';

interface SearchItem {
  slug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  importance?: string;
  interviewFrequency?: string;
  topic: string;
  primaryTopic?: string;
  secondaryTopics?: string[];
  pattern?: string;
  technique?: string;
  companies: string[];
  dataStructuresUsed?: string[];
  recognitionClues?: string;
  keywords?: string[];
  tags: string[];
  learningPath?: string;
  interviewTrick?: string;
  revisionNotes?: string;
  followUps?: string[];
  variants?: string[];
}

interface DSASearchExplorerProps {
  initialSearchIndex: SearchItem[];
}

export default function DSASearchExplorer({ initialSearchIndex }: DSASearchExplorerProps) {
  const [query, setQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');

  // Extract unique topics for filter dropdown
  const uniqueTopics = useMemo(() => {
    const set = new Set<string>();
    initialSearchIndex.forEach((item) => {
      if (item.primaryTopic) set.add(item.primaryTopic);
      if (item.topic) set.add(item.topic);
    });
    return Array.from(set).sort();
  }, [initialSearchIndex]);

  // Multi-Attribute Real-time Filter
  const filteredProblems = useMemo(() => {
    const q = query.toLowerCase().trim();

    return initialSearchIndex.filter((item) => {
      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && item.difficulty !== selectedDifficulty) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== 'ALL') {
        const top = (item.primaryTopic || item.topic || '').toLowerCase();
        const secondaries = (item.secondaryTopics || []).map((s) => s.toLowerCase());
        if (top !== selectedTopic && !secondaries.includes(selectedTopic)) {
          return false;
        }
      }

      // Text query multi-attribute match
      if (!q) return true;

      const titleMatch = item.title.toLowerCase().includes(q);
      const slugMatch = item.slug.toLowerCase().includes(q);
      const topicMatch = (item.primaryTopic || item.topic || '').toLowerCase().includes(q);
      const secondaryMatch = (item.secondaryTopics || []).some((s) => s.toLowerCase().includes(q));
      const patternMatch = (item.pattern || '').toLowerCase().includes(q);
      const techniqueMatch = (item.technique || '').toLowerCase().includes(q);
      const companyMatch = (item.companies || []).some((c) => c.toLowerCase().includes(q));
      const dsMatch = (item.dataStructuresUsed || []).some((ds) => ds.toLowerCase().includes(q));
      const cluesMatch = (item.recognitionClues || '').toLowerCase().includes(q);
      const keywordsMatch = (item.keywords || []).some((k) => k.toLowerCase().includes(q));
      const trickMatch = (item.interviewTrick || '').toLowerCase().includes(q);
      const notesMatch = (item.revisionNotes || '').toLowerCase().includes(q);
      const followUpsMatch = (item.followUps || []).some((f) => f.toLowerCase().includes(q));
      const variantsMatch = (item.variants || []).some((v) => v.toLowerCase().includes(q));

      return (
        titleMatch ||
        slugMatch ||
        topicMatch ||
        secondaryMatch ||
        patternMatch ||
        techniqueMatch ||
        companyMatch ||
        dsMatch ||
        cluesMatch ||
        keywordsMatch ||
        trickMatch ||
        notesMatch ||
        followUpsMatch ||
        variantsMatch
      );
    });
  }, [initialSearchIndex, query, selectedDifficulty, selectedTopic]);

  return (
    <div className="space-y-6 font-sans">
      {/* Search Bar & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Main Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Title, Pattern, Technique, Company, Data Structure, Keywords (e.g. 'Kadane', 'Stack', 'Amazon', 'Sliding Window')..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors font-mono"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 w-full md:w-auto text-xs">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 capitalize"
            >
              <option value="ALL">All Topics ({uniqueTopics.length})</option>
              {uniqueTopics.map((top) => (
                <option key={top} value={top}>
                  {top.replace(/-/g, ' ')}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 font-mono"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
          <span>
            Found <strong className="text-violet-400">{filteredProblems.length}</strong> problems matching criteria
          </span>
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedDifficulty('ALL');
                setSelectedTopic('ALL');
              }}
              className="text-slate-400 hover:text-slate-200 underline text-[11px]"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Filtered Search Results Grid / Table */}
      {query || selectedDifficulty !== 'ALL' || selectedTopic !== 'ALL' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Topic</th>
                <th className="px-6 py-3.5">Difficulty</th>
                <th className="px-6 py-3.5">Pattern</th>
                <th className="px-6 py-3.5">Companies</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-mono">
                    No problems found matching query &quot;{query}&quot;. Try adjusting your keywords.
                  </td>
                </tr>
              ) : (
                filteredProblems.slice(0, 50).map((prob) => {
                  const diffColor =
                    prob.difficulty === 'EASY'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : prob.difficulty === 'MEDIUM'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

                  return (
                    <tr key={prob.slug} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">
                        <Link href={`/dsa/workspace/${prob.slug}`} className="hover:text-violet-300 transition-colors">
                          {prob.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono text-indigo-300 text-[11px] uppercase">
                        {prob.primaryTopic || prob.topic}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-violet-300 font-medium">{prob.pattern || 'Standard'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(prob.companies || []).slice(0, 3).map((c) => (
                            <span key={c} className="text-[10px] bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dsa/workspace/${prob.slug}`}
                          className="text-violet-400 hover:text-violet-300 font-bold inline-flex items-center space-x-1"
                        >
                          <span>Solve</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {filteredProblems.length > 50 && (
            <div className="p-3 text-center text-xs text-slate-400 bg-slate-950 font-mono">
              Showing top 50 matches out of {filteredProblems.length}. Refine search query for specific problems.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
