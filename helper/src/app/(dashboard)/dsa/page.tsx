// helper/src/app/(dashboard)/dsa/page.tsx

import React from 'react';
import Link from 'next/link';
import { DSA_TOPICS_31 } from '@backend/features/dsa/topicTaxonomy';
import { LEARNING_PATHS } from '@backend/features/dsa/learningPathTaxonomy';
import { ProblemLoader } from '@backend/features/dsa/problemLoader';
import { CodingProblemRepository } from '@backend/features/liveCoding/repository';
import { ArrowRight, ChevronRight, Flame } from 'lucide-react';

import DSASearchExplorer from '@/components/dsa/DSASearchExplorer';

const TOPIC_COMPLEXITY_MAP: Record<string, string> = {
  arrays: 'O(n)',
  strings: 'O(n)',
  hashing: 'O(1)*',
  'two-pointers': 'O(n)',
  'sliding-window': 'O(n)',
  'binary-search': 'O(log n)',
  stack: 'O(n)',
  queue: 'O(n)',
  'linked-list': 'O(n)',
  recursion: 'O(2ⁿ)',
  backtracking: 'O(2ⁿ)',
  greedy: 'O(n log n)',
  'heap-priority-queue': 'O(log n)',
  trees: 'O(n)',
  'binary-search-trees': 'O(n)',
  trie: 'O(L)',
  graphs: 'O(V+E)',
  'dynamic-programming': 'O(n²)',
  'bit-manipulation': 'O(1)',
  math: 'O(1)',
  design: 'O(1)*',
  intervals: 'O(n log n)',
  matrix: 'O(m×n)',
  'union-find': 'O(α(n))',
  'topological-sort': 'O(V+E)',
  'shortest-path': 'O(E log V)',
  'advanced-graphs': 'O(V+E)',
  'advanced-dp': 'O(n²)',
  miscellaneous: 'O(n)',
};

export default async function DSAStudioTopicPage() {
  // Load static search index
  const searchIndex = ProblemLoader.loadSearchIndex();

  // Load all problems dynamically
  let allProblems: any[] = [];
  try {
    allProblems = await CodingProblemRepository.getAllProblems();
  } catch {
    allProblems = ProblemLoader.loadAllDirectoryProblems();
  }

  if (!allProblems || allProblems.length === 0) {
    allProblems = ProblemLoader.loadAllDirectoryProblems();
  }

  // Calculate dynamic stats per topic
  const topicStatsMap: Record<
    string,
    { total: number; easy: number; medium: number; hard: number }
  > = {};

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
    graphs: [
      'graph',
      'graphs',
      'advanced-graphs',
      'shortest-path',
      'topological-sort',
      'union-find',
    ],
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
    const tags = (prob.tags || []).map((t: any) =>
      (typeof t === 'string' ? t : t.name).toLowerCase()
    );
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
    <div className="space-y-8 animate-fade-in text-slate-100 font-sans">
      {/* Hero Section */}
      <section className="relative pt-2 pb-8 border-b border-slate-800/80 space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-white">
            Master Data Structures &amp; Algorithms
          </h1>
          <p className="text-slate-400 max-w-2xl text-sm md:text-base leading-relaxed">
            Structured categories, multi-attribute search, pattern recognition, topic roadmaps, and detailed metadata — one place to practice and master coding interviews.
          </p>
        </div>

        {/* Hero Stats */}
        <div className="flex flex-wrap gap-8 py-2">
          <div className="space-y-0.5">
            <div className="font-mono text-2xl font-bold text-slate-100">{DSA_TOPICS_31.length}</div>
            <div className="font-mono text-xs text-slate-500">TOPICS</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-mono text-2xl font-bold text-slate-100">{LEARNING_PATHS.length}</div>
            <div className="font-mono text-xs text-slate-500">LEARNING PATHS</div>
          </div>
        </div>

        {/* Action Button: Resume Recommended Problem */}
        <div>
          <Link
            href="/dsa/workspace/largest-rectangle-in-histogram"
            className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-mono font-bold text-xs px-5 py-3 rounded-lg transition-colors shadow-lg shadow-amber-950/30"
          >
            <Flame className="w-4 h-4 text-slate-950" />
            <span>Resume: Largest Rectangle in Histogram</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Multi-Attribute Real-time Search Explorer */}
      <DSASearchExplorer initialSearchIndex={searchIndex} />

      {/* Section 01: Structured Learning Paths (Compact List Rows) */}
      <section className="space-y-4">
        <div className="font-mono text-xs text-slate-500 flex items-center gap-3">
          <span className="text-teal-300 font-bold">01</span>
          <span className="text-slate-300">structured_learning_paths</span>
          <span>({LEARNING_PATHS.length})</span>
          <div className="flex-1 h-px bg-slate-800/80" />
        </div>

        <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-900/60 divide-y divide-slate-800/80">
          {LEARNING_PATHS.map((path, idx) => (
            <Link
              key={path.slug}
              href="/dsa/learning-paths"
              className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 hover:bg-slate-800/60 transition-colors"
            >
              <div className="font-mono text-xs text-slate-500 w-6 shrink-0">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className="font-bold text-sm text-white md:w-48 shrink-0 group-hover:text-amber-300 transition-colors">
                {path.title}
              </div>
              <div className="text-xs text-slate-400 flex-1 line-clamp-1">
                {path.description}
              </div>
              <div className="font-mono text-xs text-slate-500 flex items-center gap-4 shrink-0">
                <span>{path.recommendedDays}d · {path.targetAudience.split('/')[0]}</span>
                <span className="text-amber-400 font-mono text-sm group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 02: All DSA Topics (3-Column Topic Cards Grid) */}
      <section className="space-y-4 pt-4">
        <div className="font-mono text-xs text-slate-500 flex items-center gap-3">
          <span className="text-teal-300 font-bold">02</span>
          <span className="text-slate-300">all_dsa_topics</span>
          <span>({DSA_TOPICS_31.length})</span>
          <div className="flex-1 h-px bg-slate-800/80" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DSA_TOPICS_31.map((topic) => {
            const complexity = TOPIC_COMPLEXITY_MAP[topic.slug] || 'O(n)';

            return (
              <Link
                key={topic.slug}
                href={`/dsa/topics/${topic.slug}`}
                className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm backdrop-blur-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-mono font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                      {topic.name}
                    </h3>
                    {/* Complexity Badge */}
                    <div className="inline-block font-mono text-[11px] text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded shrink-0">
                      {complexity}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-500">
                    Explore topic problems
                  </span>

                  <div className="font-mono text-xs text-slate-400 group-hover:text-amber-400 transition-colors flex items-center gap-1">
                    <span>Explore</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}