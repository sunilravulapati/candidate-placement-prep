'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Code2,
  Brain,
  BookOpen,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import type { SearchResultItem } from '@/app/api/search/route';

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Results' },
  { id: 'dsa', label: 'DSA Problems' },
  { id: 'aptitude', label: 'Aptitude' },
  { id: 'page', label: 'Pages' },
  { id: 'knowledge', label: 'Knowledge Hub' },
];

export default function GlobalSearchDialog({
  isOpen,
  onClose,
  initialQuery = '',
}: GlobalSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Sync initial query when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Fetch search results
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (activeCategory !== 'all') params.set('category', activeCategory);

        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, activeCategory, isOpen]);

  // Navigate to selected result
  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      onClose();
      router.push(item.href);
    },
    [onClose, router]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-search-index="${selectedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'dsa':
        return Code2;
      case 'aptitude':
        return Brain;
      case 'knowledge':
        return BookOpen;
      case 'page':
      default:
        return LayoutDashboard;
    }
  };

  const getBadgeStyle = (color?: SearchResultItem['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'violet':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'indigo':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:pt-20 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/95 shadow-2xl shadow-violet-950/40 backdrop-blur-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-800/80 px-4 py-3.5 gap-3">
          <Search className="h-5 w-5 text-violet-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems, topics, aptitude, pages, guides..."
            className="w-full bg-transparent text-sm sm:text-base text-white outline-none placeholder:text-slate-500 font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold text-slate-400">
              ESC
            </span>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/60 bg-slate-950/40 px-4 py-2 no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all shrink-0 ${
                activeCategory === tab.id
                  ? 'bg-violet-600/30 text-violet-200 border border-violet-500/40 shadow-sm shadow-violet-900/40'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div
          ref={resultsContainerRef}
          className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-800/40 no-scrollbar"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
              <span>Searching repository...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-slate-500">
                Try searching for problem names, companies (Google, Amazon), or topics (Dynamic Programming, Syllogisms).
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {!query && (
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Quick Links & Popular Topics
                </div>
              )}
              {results.map((item, idx) => {
                const Icon = getCategoryIcon(item.category);
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={item.id}
                    data-search-index={idx}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-violet-600/20 border border-violet-500/30 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className={`rounded-lg p-2 shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-violet-500/30 text-violet-300'
                            : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate text-slate-100 group-hover:text-white">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border shrink-0 ${getBadgeStyle(
                                item.badgeColor
                              )}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-violet-400 translate-x-0.5'
                          : 'text-slate-600 opacity-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60 px-4 py-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] font-bold text-slate-400">
                ↑
              </kbd>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] font-bold text-slate-400">
                ↓
              </kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] font-bold text-slate-400">
                ↵
              </kbd>
              to select
            </span>
          </div>
          <span>
            {results.length} {results.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
}
