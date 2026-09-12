'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Code2,
  RotateCcw,
  Sparkles,
  Compass,
} from 'lucide-react';
import {
  OACuratedProblem,
  OAPatternPlaybook,
} from '@backend/features/dsa/oaEssentialsData';

interface OAEssentialsExplorerProps {
  problems: OACuratedProblem[];
  playbooks: OAPatternPlaybook[];
  solvedSlugs: string[]; // List of slugs solved by the user
}

export default function OAEssentialsExplorer({
  problems,
  playbooks,
  solvedSlugs,
}: OAEssentialsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('RANK');
  const [showPlaybooks, setShowPlaybooks] = useState(false);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);

  // Accordion state for problem cards (which card has trigger/trap/template expanded)
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [copiedTemplateRank, setCopiedTemplateRank] = useState<number | null>(null);

  const solvedSet = useMemo(() => new Set(solvedSlugs), [solvedSlugs]);

  // Determine if a problem is solved
  const isProblemSolved = useCallback(
    (prob: OACuratedProblem) => {
      return (
        solvedSet.has(prob.slug) ||
        Boolean(prob.equivalentSlug && solvedSet.has(prob.equivalentSlug))
      );
    },
    [solvedSet]
  );

  // Progress metrics
  const totalCount = problems.length;
  const solvedCount = useMemo(() => {
    return problems.filter(isProblemSolved).length;
  }, [problems, isProblemSolved]);

  const p0Problems = useMemo(
    () => problems.filter((p) => p.priority.includes('P0')),
    [problems]
  );
  const p0Solved = useMemo(
    () => p0Problems.filter(isProblemSolved).length,
    [p0Problems, isProblemSolved]
  );

  const easyProblems = useMemo(
    () => problems.filter((p) => p.difficulty === 'EASY'),
    [problems]
  );
  const easySolved = useMemo(
    () => easyProblems.filter(isProblemSolved).length,
    [easyProblems, isProblemSolved]
  );

  const mediumProblems = useMemo(
    () => problems.filter((p) => p.difficulty === 'MEDIUM'),
    [problems]
  );
  const mediumSolved = useMemo(
    () => mediumProblems.filter(isProblemSolved).length,
    [mediumProblems, isProblemSolved]
  );

  const hardProblems = useMemo(
    () => problems.filter((p) => p.difficulty === 'HARD'),
    [problems]
  );
  const hardSolved = useMemo(
    () => hardProblems.filter(isProblemSolved).length,
    [hardProblems, isProblemSolved]
  );

  const completionPercentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  // Find top priority unsolved problem to resume
  const topUnsolvedProblem = useMemo(() => {
    return (
      problems.find((p) => p.priority.includes('P0') && !isProblemSolved(p)) ||
      problems.find((p) => !isProblemSolved(p))
    );
  }, [problems, isProblemSolved]);

  // Unique Tiers for filter tabs
  const availableTiers = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => {
      if (p.tier) set.add(p.tier);
    });
    return Array.from(set).sort();
  }, [problems]);

  // Filter and sort problems
  const filteredProblems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = problems.filter((p) => {
      // Tier filter
      if (selectedTier !== 'ALL' && p.tier !== selectedTier) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'ALL') {
        if (!p.priority.toLowerCase().includes(selectedPriority.toLowerCase())) {
          return false;
        }
      }

      // Difficulty filter
      if (selectedDifficulty !== 'ALL' && p.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'SOLVED' && !isProblemSolved(p)) return false;
      if (selectedStatus === 'UNSOLVED' && isProblemSolved(p)) return false;

      // Platform filter
      if (selectedPlatform !== 'ALL' && p.platform !== selectedPlatform) {
        return false;
      }

      // Playbook match filter
      if (selectedPlaybookId) {
        const activePlaybook = playbooks.find((pb) => pb.id === selectedPlaybookId);
        if (activePlaybook) {
          const patternMatch = p.pattern
            .toLowerCase()
            .includes(activePlaybook.corePattern.toLowerCase().split('/')[0].trim());
          const triggerMatch = activePlaybook.targetQuestions
            .toLowerCase()
            .includes(p.title.toLowerCase());
          if (!patternMatch && !triggerMatch) return false;
        }
      }

      // Text query match
      if (!q) return true;

      const titleMatch = p.title.toLowerCase().includes(q);
      const patternMatch = p.pattern.toLowerCase().includes(q);
      const triggerMatch = p.trigger.toLowerCase().includes(q);
      const trapMatch = p.trap.toLowerCase().includes(q);
      const companyMatch = (p.companies || []).some((c) =>
        c.toLowerCase().includes(q)
      );
      const tierMatch = p.tier.toLowerCase().includes(q);

      return (
        titleMatch ||
        patternMatch ||
        triggerMatch ||
        trapMatch ||
        companyMatch ||
        tierMatch
      );
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'RANK') return a.rank - b.rank;
      if (sortBy === 'PRIORITY') {
        const prioScore = (p: string) =>
          p.includes('P0') ? 0 : p.includes('P1') ? 1 : 2;
        return prioScore(a.priority) - prioScore(b.priority) || a.rank - b.rank;
      }
      if (sortBy === 'DIFFICULTY_ASC') {
        const diffScore = (d: string) =>
          d === 'EASY' ? 0 : d === 'MEDIUM' ? 1 : 2;
        return diffScore(a.difficulty) - diffScore(b.difficulty) || a.rank - b.rank;
      }
      if (sortBy === 'DIFFICULTY_DESC') {
        const diffScore = (d: string) =>
          d === 'HARD' ? 0 : d === 'MEDIUM' ? 1 : 2;
        return diffScore(a.difficulty) - diffScore(b.difficulty) || a.rank - b.rank;
      }
      if (sortBy === 'UNSOLVED_FIRST') {
        const solvedA = isProblemSolved(a) ? 1 : 0;
        const solvedB = isProblemSolved(b) ? 1 : 0;
        return solvedA - solvedB || a.rank - b.rank;
      }
      if (sortBy === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      return a.rank - b.rank;
    });
  }, [
    problems,
    searchQuery,
    selectedTier,
    selectedPriority,
    selectedDifficulty,
    selectedStatus,
    selectedPlatform,
    selectedPlaybookId,
    sortBy,
    playbooks,
    isProblemSolved,
  ]);

  const toggleExpand = (rank: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [rank]: !prev[rank],
    }));
  };

  const handleCopyTemplate = (rank: number, template: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(template);
    setCopiedTemplateRank(rank);
    setTimeout(() => setCopiedTemplateRank(null), 2000);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTier('ALL');
    setSelectedPriority('ALL');
    setSelectedDifficulty('ALL');
    setSelectedStatus('ALL');
    setSelectedPlatform('ALL');
    setSelectedPlaybookId(null);
    setSortBy('RANK');
  };

  const activeFiltersCount =
    (selectedTier !== 'ALL' ? 1 : 0) +
    (selectedPriority !== 'ALL' ? 1 : 0) +
    (selectedDifficulty !== 'ALL' ? 1 : 0) +
    (selectedStatus !== 'ALL' ? 1 : 0) +
    (selectedPlatform !== 'ALL' ? 1 : 0) +
    (selectedPlaybookId ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="space-y-8 animate-fade-in text-slate-100 font-sans">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link href="/dsa" className="hover:text-amber-300 transition-colors">
          DSA Studio
        </Link>
        <span>/</span>
        <Link href="/dsa/learning-paths" className="hover:text-amber-300 transition-colors">
          Learning Paths
        </Link>
        <span>/</span>
        <span className="text-amber-400 font-bold">OA Essentials</span>
      </nav>

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-amber-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-wide">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>HIGH-YIELD ONLINE ASSESSMENT CURATION</span>
            </div>

            <button
              onClick={() => setShowPlaybooks(!showPlaybooks)}
              className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all shadow-sm"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>{showPlaybooks ? 'Hide Playbook Matrix' : '15s Pattern Diagnostic Playbook'}</span>
              {showPlaybooks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-white">
              OA Essentials
            </h1>
            <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
              70 high-yield placement &amp; OA pattern archetypes curated for{' '}
              <span className="text-amber-300 font-semibold">Amazon, Uber, Goldman Sachs, and Google</span>.
              Master the exact diagnostic triggers, avoid false-friend mental traps, and run your solutions in real time.
            </p>
          </div>

          {/* Quick Stats & Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-6 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-6 md:gap-10">
              <div>
                <div className="font-mono text-2xl font-bold text-white flex items-center gap-2">
                  <span>{solvedCount}</span>
                  <span className="text-sm font-normal text-slate-400">/ {totalCount}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
                  Total Solved ({completionPercentage}%)
                </div>
              </div>

              <div>
                <div className="font-mono text-2xl font-bold text-amber-300">
                  {p0Solved} <span className="text-sm font-normal text-slate-400">/ {p0Problems.length}</span>
                </div>
                <div className="font-mono text-[11px] text-amber-400 uppercase tracking-wider">
                  P0 Crucial
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="font-mono text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-emerald-400 font-bold">Easy:</span> {easySolved} / {easyProblems.length}
                  </div>
                  <div>
                    <span className="text-amber-400 font-bold">Medium:</span> {mediumSolved} / {mediumProblems.length}
                  </div>
                  <div>
                    <span className="text-rose-400 font-bold">Hard:</span> {hardSolved} / {hardProblems.length}
                  </div>
                </div>
              </div>
            </div>

            {topUnsolvedProblem && (
              <Link
                href={`/dsa/workspace/${topUnsolvedProblem.slug}`}
                className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-amber-950/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Next Up: #{topUnsolvedProblem.rank} {topUnsolvedProblem.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Interactive 15-Second Pattern Diagnostic Matrix Drawer */}
      {showPlaybooks && (
        <section className="space-y-4 animate-fade-in p-6 rounded-2xl border border-teal-500/20 bg-slate-900/90 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-teal-400 font-mono font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>OA Recognition Matrix — How to Diagnose in Under 30 Seconds</span>
              </div>
              <p className="text-xs text-slate-400">
                Click any core pattern below to filter the question bank to questions leveraging this archetype.
              </p>
            </div>
            {selectedPlaybookId && (
              <button
                onClick={() => setSelectedPlaybookId(null)}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 underline"
              >
                Clear Playbook Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks.map((pb) => {
              const isSelected = selectedPlaybookId === pb.id;
              return (
                <div
                  key={pb.id}
                  onClick={() => setSelectedPlaybookId(isSelected ? null : pb.id)}
                  className={`cursor-pointer text-left rounded-xl p-4 border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-teal-400 bg-teal-950/30 shadow-md shadow-teal-950/50'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-mono font-bold text-sm text-white">{pb.corePattern}</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 shrink-0">
                        {pb.timeComplexity}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="text-slate-300">
                        <span className="text-slate-500 font-mono text-[11px]">SIGNAL: </span>
                        {pb.signal15Sec}
                      </div>
                      <div className="text-rose-300/90 text-[11px]">
                        <span className="text-rose-400/80 font-mono">TRAP: </span>
                        {pb.commonTrap}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="line-clamp-1">{pb.targetQuestions}</span>
                    <span className="text-teal-400 font-bold hover:underline shrink-0 ml-2">
                      {isSelected ? 'Selected ✓' : 'Filter →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter and Control Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, pattern archetype, trigger clue, or company (e.g. Goldman Sachs, Sliding Window)..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Select Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="P0">P0 - Crucial Only</option>
              <option value="P1">P1 - High Yield</option>
              <option value="P2">P2 - Speed/Edge</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            {/* Solved Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="UNSOLVED">Unsolved Only</option>
              <option value="SOLVED">Solved Only</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="RANK">Sort: OA Rank #</option>
              <option value="PRIORITY">Sort: Priority (P0 First)</option>
              <option value="UNSOLVED_FIRST">Sort: Unsolved First</option>
              <option value="DIFFICULTY_ASC">Sort: Easy → Hard</option>
              <option value="DIFFICULTY_DESC">Sort: Hard → Easy</option>
              <option value="TITLE">Sort: Title (A-Z)</option>
            </select>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white px-2 py-1 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Tier Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => setSelectedTier('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
              selectedTier === 'ALL'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/20'
                : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            All Tiers ({problems.length})
          </button>
          {availableTiers.map((tier) => {
            const count = problems.filter((p) => p.tier === tier).length;
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-950/20'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {tier} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Meta Info */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
        <div>
          Showing <span className="text-white font-bold">{filteredProblems.length}</span> of {totalCount} OA questions
          {selectedPlaybookId && (
            <span className="text-teal-400 ml-2">
              (Filtered by playbook: {playbooks.find((pb) => pb.id === selectedPlaybookId)?.corePattern})
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          Click cards to inspect Diagnostic Triggers &amp; Mental Traps
        </div>
      </div>

      {/* Question Cards Grid */}
      {filteredProblems.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-mono font-bold text-white">No OA Questions Match Your Criteria</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try relaxing your search query or reset the priority, difficulty, and tier filters.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProblems.map((prob) => {
            const solved = isProblemSolved(prob);
            const isExpanded = !!expandedCards[prob.rank];
            const isP0 = prob.priority.includes('P0');

            const diffColor =
              prob.difficulty === 'EASY'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : prob.difficulty === 'MEDIUM'
                ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

            return (
              <div
                key={prob.rank}
                className={`rounded-2xl border transition-all duration-200 bg-slate-900/70 backdrop-blur-md overflow-hidden ${
                  solved
                    ? 'border-emerald-500/30 shadow-sm shadow-emerald-950/20'
                    : isP0
                    ? 'border-amber-500/30 hover:border-amber-400/60 shadow-sm shadow-amber-950/10'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Main Card Header / Row */}
                <div
                  onClick={() => toggleExpand(prob.rank)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start md:items-center gap-4">
                    {/* Solved Status Indicator */}
                    <div className="pt-0.5 md:pt-0 shrink-0">
                      {solved ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-slate-600">
                          <Circle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Rank Badge */}
                    <div
                      className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md shrink-0 border ${
                        isP0
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700'
                      }`}
                    >
                      #{String(prob.rank).padStart(2, '0')}
                    </div>

                    {/* Title & Core Tags */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-mono font-bold text-base text-white hover:text-amber-300 transition-colors">
                          {prob.title}
                        </h3>

                        {/* Priority Badge */}
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                            isP0
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : prob.priority.includes('P1')
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {prob.priority.split('-')[0].trim()}
                        </span>

                        {/* Difficulty Pill */}
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${diffColor}`}>
                          {prob.difficulty}
                        </span>

                        {/* Platform Badge */}
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                          {prob.platform}
                        </span>
                      </div>

                      {/* Pattern & Tier Subtitle */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                        <span className="text-teal-300 font-semibold">{prob.pattern}</span>
                        <span>·</span>
                        <span className="text-slate-400">{prob.tier}</span>
                        {prob.companies && prob.companies.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-slate-400 line-clamp-1">
                              {prob.companies.slice(0, 3).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <Link
                      href={`/dsa/workspace/${prob.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm"
                    >
                      <span>{solved ? 'Review in Workspace' : 'Solve in Workspace'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(prob.rank);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title={isExpanded ? 'Collapse card' : 'Expand details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/50 space-y-4 animate-fade-in text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Diagnostic Trigger */}
                      <div className="rounded-xl border border-teal-500/20 bg-teal-950/10 p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-teal-400 font-mono font-bold text-[11px] uppercase tracking-wider">
                          <Lightbulb className="w-3.5 h-3.5 text-teal-400" />
                          <span>The Diagnostic Trigger (What tells you to use this)</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed font-sans">
                          {prob.trigger}
                        </p>
                      </div>

                      {/* Mental Trap / Twist */}
                      <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-3.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold text-[11px] uppercase tracking-wider">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>The False-Friend Trap / Twist (Why candidates fail)</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed font-sans">
                          {prob.trap}
                        </p>
                      </div>
                    </div>

                    {/* Template / Signature Code */}
                    {prob.template && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Algorithm Template / Idiom:</span>
                          </span>
                          <button
                            onClick={(e) => handleCopyTemplate(prob.rank, prob.template, e)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedTemplateRank === prob.rank ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-amber-300/90 font-mono text-xs overflow-x-auto">
                          <code>{prob.template}</code>
                        </div>
                      </div>
                    )}

                    {/* Footer Metadata */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500 border-t border-slate-800/60">
                      <div>
                        <span>Historical OA Frequency: </span>
                        <span className="text-amber-400 font-bold">{prob.frequency}%</span>
                      </div>
                      {prob.equivalentSlug && (
                        <div>
                          <span>Canonical Archetype Slug: </span>
                          <code className="text-slate-300">{prob.slug}</code>
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/dsa/workspace/${prob.slug}`}
                          className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
                        >
                          Launch in Full Editor →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
