// helper/src/app/(dashboard)/dsa/page.tsx

import React from 'react';
import Link from 'next/link';
import { DSA_TOPICS_31 } from '@backend/features/dsa/topicTaxonomy';
import { LEARNING_PATHS } from '@backend/features/dsa/learningPathTaxonomy';
import { ProblemLoader } from '@backend/features/dsa/problemLoader';
import { CodingProblemRepository } from '@backend/features/liveCoding/repository';
import {
  Code2,
  BookOpen,
  Sparkles,
  ChevronRight,
  Trophy,
  Target,
  Zap,
  Clock,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';

import DSASearchExplorer from '@/components/dsa/DSASearchExplorer';

export default async function DSAStudioTopicPage() {
  // Load static search index
  const searchIndex = ProblemLoader.loadSearchIndex();

  // Load all problems dynamically
  let allProblems: any[] = [];
  try {
    allProblems = await CodingProblemRepository.getAllProblems();
  } catch (err) {
    allProblems = ProblemLoader.loadAllDirectoryProblems();
  }

  if (!allProblems || allProblems.length === 0) {
    allProblems = ProblemLoader.loadAllDirectoryProblems();
  }

  // Calculate dynamic stats per topic
  const topicStatsMap: Record<string, { total: number; easy: number; medium: number; hard: number }> = {};

  const TOPIC_ALIASES_MAP: Record<string, string[]> = {
    arrays: ['arrays', 'array', 'arrays-strings'],
    strings: ['strings', 'string', 'arrays-strings'],
    hashing: ['hashing', 'hash-table', 'hash-map'],
    'two-pointers': ['two-pointers', 'pointers'],
    'sliding-window': ['sliding-window', 'window'],
    'binary-search': ['binary-search', 'search', 'searching-sorting'],
    stack: ['stack', 'stacks', 'stacks-queues', 'monotonic-stack'],
    queue: ['queue', 'queues', 'stacks-queues', 'monotonic-queue'],
    'linked-list': ['linked-list', 'linked-lists'],
    recursion: ['recursion', 'recursion-backtracking'],
    backtracking: ['backtracking', 'recursion-backtracking'],
    greedy: ['greedy'],
    'heap-priority-queue': ['heap', 'priority-queue', 'heap-priority-queue'],
    trees: ['tree', 'trees', 'bst', 'binary-search-tree', 'binary-search-trees'],
    'binary-search-trees': ['bst', 'binary-search-tree', 'binary-search-trees'],
    trie: ['trie', 'prefix-tree'],
    graphs: ['graph', 'graphs', 'advanced-graphs', 'shortest-path', 'topological-sort', 'union-find'],
    'dynamic-programming': ['dp', 'dynamic-programming', 'advanced-dp'],
    'bit-manipulation': ['bit-manipulation', 'bits'],
    math: ['math', 'math-geometry'],
    design: ['design', 'design-misc'],
    intervals: ['intervals'],
    matrix: ['matrix'],
    'union-find': ['union-find'],
    'topological-sort': ['topological-sort'],
    'shortest-path': ['shortest-path'],
    'advanced-graphs': ['advanced-graphs'],
    'advanced-dp': ['advanced-dp'],
    miscellaneous: ['miscellaneous'],
  };

  for (const prob of allProblems) {
    const mainTopic = (prob.primaryTopic || prob.topic || '').toLowerCase();
    const secondaries = (prob.secondaryTopics || []).map((s: string) => String(s).toLowerCase());
    const tags = (prob.tags || []).map((t: any) => (typeof t === 'string' ? t : t.name).toLowerCase());
    const topicSet = new Set([mainTopic, ...secondaries, ...tags]);

    for (const t of DSA_TOPICS_31) {
      const aliases = TOPIC_ALIASES_MAP[t.slug] || [t.slug];
      const isMatch = aliases.some((a) => topicSet.has(a) || mainTopic === a);
      if (isMatch) {
        if (!topicStatsMap[t.slug]) {
          topicStatsMap[t.slug] = { total: 0, easy: 0, medium: 0, hard: 0 };
        }
        topicStatsMap[t.slug].total++;
        if (prob.difficulty === 'EASY') topicStatsMap[t.slug].easy++;
        else if (prob.difficulty === 'MEDIUM') topicStatsMap[t.slug].medium++;
        else if (prob.difficulty === 'HARD') topicStatsMap[t.slug].hard++;
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/50 via-indigo-900/40 to-slate-900 p-8 border border-violet-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/30 px-3 py-1 rounded-full text-xs font-semibold text-violet-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement OS • DSA Studio ({allProblems.length} Total Problems)</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            DSA Master Platform
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Master Data Structures & Algorithms topic by topic across {DSA_TOPICS_31.length} standardized categories. Multi-attribute search, pattern recognition, topic roadmaps, and detailed metadata.
          </p>

          {/* Recommended Next Problem Widget */}
          <div className="bg-slate-950/80 border border-violet-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-500/20 p-2.5 rounded-lg border border-amber-500/30 text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Recommended Problem</span>
                <h4 className="text-sm font-bold text-white">Largest Rectangle in Histogram (Stack)</h4>
              </div>
            </div>
            <Link
              href="/dsa/workspace/largest-rectangle-in-histogram"
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 shrink-0"
            >
              <span>Solve Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Multi-Attribute Real-time Search Explorer */}
      <DSASearchExplorer initialSearchIndex={searchIndex} />

      {/* Featured Structured Learning Paths Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <span>Structured Learning Paths ({LEARNING_PATHS.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {LEARNING_PATHS.map((path) => (
            <Link
              key={path.slug}
              href={`/dsa/learning-paths`}
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/40 p-5 rounded-xl transition-all duration-200 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  {path.recommendedDays} Days
                </span>
                <h3 className="text-base font-bold text-white">{path.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{path.description}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <span>{path.targetAudience.split('/')[0]}</span>
                <ChevronRight className="w-4 h-4 text-violet-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 31 Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>All DSA Topics ({DSA_TOPICS_31.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DSA_TOPICS_31.map((topic) => {
            const stats = topicStatsMap[topic.slug] || {
              total: 0,
              easy: 0,
              medium: 0,
              hard: 0,
            };
            const safeTotal = Math.max(1, stats.total);

            return (
              <Link
                key={topic.slug}
                href={`/dsa/topics/${topic.slug}`}
                className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors">
                      {topic.name}
                    </h3>
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      {stats.total} Problems
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>

                  {/* Difficulty Breakdown Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: stats.total > 0 ? `${(stats.easy / safeTotal) * 100}%` : '0%' }} title={`Easy: ${stats.easy}`} />
                      <div className="bg-amber-500 h-full" style={{ width: stats.total > 0 ? `${(stats.medium / safeTotal) * 100}%` : '0%' }} title={`Medium: ${stats.medium}`} />
                      <div className="bg-rose-500 h-full" style={{ width: stats.total > 0 ? `${(stats.hard / safeTotal) * 100}%` : '0%' }} title={`Hard: ${stats.hard}`} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-emerald-400 font-semibold">Easy {stats.easy}</span>
                      <span className="text-amber-400 font-semibold">Med {stats.medium}</span>
                      <span className="text-rose-400 font-semibold">Hard {stats.hard}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400">~{topic.estimatedHours} hrs</span>
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>Explore Topic</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}