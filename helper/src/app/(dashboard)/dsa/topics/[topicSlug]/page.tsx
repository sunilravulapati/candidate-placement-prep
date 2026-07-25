// helper/src/app/(dashboard)/dsa/topics/[topicSlug]/page.tsx

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DSA_TOPICS_31 } from '@backend/features/dsa/topicTaxonomy';
import { ProblemLoader } from '@backend/features/dsa/problemLoader';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Flame,
  Layers,
  Sparkles,
  Trophy,
  Building2,
  ChevronRight,
  ArrowRight,
  Compass,
  GitBranch,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';

interface TopicPageProps {
  params: Promise<{ topicSlug: string }>;
}

export default async function DSATopicDetailPage({ params }: TopicPageProps) {
  const { topicSlug } = await params;
  const slugLower = topicSlug.toLowerCase();
  
  // Load all directory problems
  const allProblems = ProblemLoader.loadAllDirectoryProblems();

  const TOPIC_ALIASES_MAP: Record<string, string[]> = {
    arrays: ['arrays', 'array', 'arrays-strings'],
    'arrays-strings': ['arrays', 'array', 'strings', 'string', 'arrays-strings'],
    strings: ['strings', 'string', 'arrays-strings'],
    hashing: ['hashing', 'hash-table', 'hash-map'],
    'two-pointers': ['two-pointers', 'pointers'],
    'sliding-window': ['sliding-window', 'window'],
    'binary-search': ['binary-search', 'search', 'searching-sorting'],
    stack: ['stack', 'stacks', 'stacks-queues', 'monotonic-stack'],
    queue: ['queue', 'queues', 'stacks-queues', 'monotonic-queue'],
    'stacks-queues': ['stack', 'stacks', 'queue', 'queues', 'stacks-queues'],
    'linked-list': ['linked-list', 'linked-lists'],
    'linked-lists': ['linked-list', 'linked-lists'],
    recursion: ['recursion', 'recursion-backtracking'],
    backtracking: ['backtracking', 'recursion-backtracking'],
    'recursion-backtracking': ['recursion', 'backtracking', 'recursion-backtracking'],
    greedy: ['greedy'],
    'heap-priority-queue': ['heap', 'priority-queue', 'heap-priority-queue'],
    trees: ['tree', 'trees', 'bst', 'binary-search-tree', 'binary-search-trees'],
    tree: ['tree', 'trees', 'bst', 'binary-search-tree', 'binary-search-trees'],
    'binary-search-trees': ['bst', 'binary-search-tree', 'binary-search-trees'],
    trie: ['trie', 'prefix-tree'],
    graphs: ['graph', 'graphs', 'advanced-graphs', 'shortest-path', 'topological-sort', 'union-find'],
    graph: ['graph', 'graphs', 'advanced-graphs', 'shortest-path', 'topological-sort', 'union-find'],
    'dynamic-programming': ['dp', 'dynamic-programming', 'advanced-dp'],
    dp: ['dp', 'dynamic-programming', 'advanced-dp'],
    'bit-manipulation': ['bit-manipulation', 'bits'],
    math: ['math', 'math-geometry'],
    design: ['design', 'design-misc'],
  };

  const topicAliases = TOPIC_ALIASES_MAP[slugLower] || [slugLower];
  const taxonomyTopic = DSA_TOPICS_31.find((t) => t.slug === slugLower || topicAliases.includes(t.slug));

  // Filter Primary Problems
  const primaryProblems = allProblems.filter((p) => {
    const top = (p.primaryTopic || p.topic || '').toLowerCase();
    return top === slugLower || topicAliases.includes(top);
  });

  // Filter Secondary Problems ("Also Appears In")
  const secondaryProblems = allProblems.filter((p) => {
    const top = (p.primaryTopic || p.topic || '').toLowerCase();
    const secondaries = (p.secondaryTopics || []).map((s) => String(s).toLowerCase());
    return !primaryProblems.some((prim) => prim.slug === p.slug) && secondaries.some((s) => topicAliases.includes(s));
  });

  const totalPrimary = primaryProblems.length;
  const totalSecondary = secondaryProblems.length;

  if (totalPrimary === 0 && totalSecondary === 0 && !taxonomyTopic) {
    notFound();
  }

  const topicName = taxonomyTopic?.name || slugLower.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const topicDesc = taxonomyTopic?.description || `Master ${topicName} algorithmic patterns, data structures, and top tech interview questions.`;
  const estHours = taxonomyTopic?.estimatedHours || 12;

  // Extract unique patterns in this topic
  const commonPatterns = Array.from(
    new Set(primaryProblems.map((p) => p.pattern).filter(Boolean))
  ).slice(0, 8);

  // Difficulty breakdown
  const easyCount = primaryProblems.filter((p) => p.difficulty === 'EASY').length;
  const medCount = primaryProblems.filter((p) => p.difficulty === 'MEDIUM').length;
  const hardCount = primaryProblems.filter((p) => p.difficulty === 'HARD').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8 font-sans">
      {/* Back Link */}
      <Link
        href="/dsa"
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All DSA Topics</span>
      </Link>

      {/* Topic Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{topicName}</h1>
              <span className="text-xs bg-violet-500/10 border border-violet-500/30 text-violet-300 px-3 py-1 rounded-full font-semibold font-mono">
                ~{estHours} Hours Track
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{topicDesc}</p>
          </div>

          {/* Progress Card */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3 min-w-[240px]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase tracking-wider">Primary Problems</span>
              <span className="text-violet-400 font-bold font-mono">{totalPrimary} Total</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: totalPrimary > 0 ? `${(easyCount / totalPrimary) * 100}%` : '0%' }}
                title={`Easy: ${easyCount}`}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: totalPrimary > 0 ? `${(medCount / totalPrimary) * 100}%` : '0%' }}
                title={`Med: ${medCount}`}
              />
              <div
                className="bg-rose-500 h-full"
                style={{ width: totalPrimary > 0 ? `${(hardCount / totalPrimary) * 100}%` : '0%' }}
                title={`Hard: ${hardCount}`}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-emerald-400 font-semibold">Easy {easyCount}</span>
              <span className="text-amber-400 font-semibold">Med {medCount}</span>
              <span className="text-rose-400 font-semibold">Hard {hardCount}</span>
            </div>
          </div>
        </div>

        {/* Common Patterns in Topic */}
        {commonPatterns.length > 0 && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Core Algorithmic Patterns in {topicName}:
            </span>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((pat) => (
                <span
                  key={pat}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium px-3 py-1 rounded-lg"
                >
                  {pat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap / Learning Sequence */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-4">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-violet-400" />
            <span className="text-slate-400 font-semibold">Prerequisite Flow:</span>
            <span className="text-slate-300 font-mono">Learn Arrays/Strings</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-violet-300 font-bold font-mono">{topicName}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-300 font-mono">Advanced Graphs/DP</span>
          </div>

          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400 font-semibold">Top Companies:</span>
            <div className="flex gap-1">
              {['Amazon', 'Google', 'Meta', 'Microsoft'].map((c) => (
                <span key={c} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Questions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-violet-400" />
            <span>Primary Questions ({totalPrimary})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Sorted by Topic Roadmap</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="px-6 py-3.5">#</th>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Difficulty</th>
                <th className="px-6 py-3.5">Pattern</th>
                <th className="px-6 py-3.5">Technique</th>
                <th className="px-6 py-3.5">Solve Time</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {primaryProblems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-mono">
                    No primary problems assigned to {topicName} yet.
                  </td>
                </tr>
              ) : (
                primaryProblems.map((prob, idx) => {
                  const diffColor =
                    prob.difficulty === 'EASY'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : prob.difficulty === 'MEDIUM'
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

                  return (
                    <tr key={prob.slug} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500">{prob.questionNo || idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-white">
                        <Link href={`/dsa/workspace/${prob.slug}`} className="hover:text-violet-300 transition-colors">
                          {prob.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-violet-300 font-medium">
                        {prob.pattern || 'Standard'}
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-[11px]">
                        {prob.technique || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {prob.estimatedSolveTime || '20 mins'}
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
        </div>
      </div>

      {/* Secondary Problems ("Also Appears In") */}
      {secondaryProblems.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-200 flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-indigo-400" />
              <span>Also Appears In ({totalSecondary})</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Problems where {topicName} is a secondary topic</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Primary Topic</th>
                  <th className="px-6 py-3.5">Difficulty</th>
                  <th className="px-6 py-3.5">Pattern</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {secondaryProblems.map((prob) => {
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
                      <td className="px-6 py-4 font-mono text-indigo-300 uppercase text-[11px]">
                        {prob.primaryTopic || prob.topic}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${diffColor}`}>
                          {prob.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{prob.pattern || 'Standard'}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dsa/workspace/${prob.slug}`}
                          className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center space-x-1"
                        >
                          <span>View Problem</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
