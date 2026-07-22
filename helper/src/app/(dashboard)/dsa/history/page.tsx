'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  ArrowLeft,
  ChevronRight,
  Filter,
  Code2,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { getSubmissionHistoryAction } from '@backend/features/liveCoding/actions';

// ── Types ─────────────────────────────────────────────────────────────────────

type HistoryItem = {
  id: string;
  problemSlug: string;
  problemTitle: string;
  difficulty: string;
  language: string;
  status: string;
  executionTimeMs: number | null;
  memoryBytes: number | null;
  passedCount: number;
  totalCount: number;
  createdAt: Date;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRuntime(ms: number | null): string {
  if (ms == null) return 'N/A';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatMemory(bytes: number | null): string {
  if (bytes == null) return 'N/A';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'ACCEPTED':
      return { label: 'Accepted', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' };
    case 'WRONG_ANSWER':
      return { label: 'Wrong Answer', icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' };
    case 'TIME_LIMIT_EXCEEDED':
      return { label: 'TLE', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' };
    case 'RUNTIME_ERROR':
      return { label: 'Runtime Error', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' };
    case 'COMPILE_ERROR':
      return { label: 'Compile Error', icon: Code2, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' };
    default:
      return { label: status, icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' };
  }
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  HARD: 'text-rose-400',
};

const STATUS_FILTERS = ['All', 'ACCEPTED', 'WRONG_ANSWER', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED'];
const STATUS_LABELS: Record<string, string> = {
  All: 'All',
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  COMPILE_ERROR: 'Compile Error',
  RUNTIME_ERROR: 'Runtime Error',
  TIME_LIMIT_EXCEEDED: 'TLE',
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function SubmissionHistoryPage() {
  const [submissions, setSubmissions] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSubmissionHistoryAction();
      setSubmissions(data as HistoryItem[]);
    } catch (err) {
      setError('Failed to load submission history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const filtered = statusFilter === 'All'
    ? submissions
    : submissions.filter((s) => s.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dsa"
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          title="Back to DSA Studio"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dsa" className="hover:text-slate-300 transition-colors">DSA Studio</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 font-medium">Submission History</span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <History className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Submission History</h1>
            <p className="text-slate-400 text-sm">
              {loading ? 'Loading...' : `${submissions.length} total submission${submissions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              statusFilter === f
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            )}
          >
            {STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <span className="text-slate-400">Loading submissions...</span>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
          <p className="text-rose-400 font-medium">{error}</p>
          <button onClick={loadHistory} className="mt-3 text-sm text-rose-400 underline hover:no-underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
          <History className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400 mb-2">
            {statusFilter === 'All' ? 'No submissions yet' : `No ${STATUS_LABELS[statusFilter]} submissions`}
          </h3>
          <p className="text-slate-600 text-sm mb-6">
            {statusFilter === 'All'
              ? 'Start solving problems to track your history here.'
              : 'Try a different filter or solve more problems.'}
          </p>
          <Link
            href="/dsa/library"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            Browse Problems
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Problem</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tests</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Runtime</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Memory</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Language</th>
                  <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">When</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => {
                  const statusConfig = getStatusConfig(sub.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr
                      key={sub.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/dsa/workspace/${sub.problemSlug}`}
                          className="font-medium text-slate-200 hover:text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1"
                        >
                          {sub.problemTitle}
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <span className={cn('text-xs font-medium', DIFFICULTY_COLORS[sub.difficulty] ?? 'text-slate-400')}>
                          {sub.difficulty.charAt(0) + sub.difficulty.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border', statusConfig.color, statusConfig.bg)}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">
                        {sub.passedCount}/{sub.totalCount}
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRuntime(sub.executionTimeMs)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Cpu className="w-3.5 h-3.5" />
                          {formatMemory(sub.memoryBytes)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-slate-300 border border-slate-700">
                          {sub.language}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatRelativeTime(sub.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-800/50">
            {filtered.map((sub) => {
              const statusConfig = getStatusConfig(sub.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div key={sub.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/dsa/workspace/${sub.problemSlug}`}
                      className="font-medium text-slate-200 hover:text-indigo-300 transition-colors text-sm"
                    >
                      {sub.problemTitle}
                    </Link>
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0', statusConfig.color, statusConfig.bg)}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className={cn('font-medium', DIFFICULTY_COLORS[sub.difficulty] ?? 'text-slate-400')}>
                      {sub.difficulty}
                    </span>
                    <span>{sub.language}</span>
                    <span>{formatRuntime(sub.executionTimeMs)}</span>
                    <span>{formatRelativeTime(sub.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
