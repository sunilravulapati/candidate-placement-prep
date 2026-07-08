'use client';

import React from 'react';
import { Layout } from 'lucide-react';

interface SideBySideComparisonProps {
  originalText: string;
  generatedText?: string;
  jdText: string;
  matchingSkills: string[];
  missingSkills: string[];
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTerms(terms: string[]) {
  return [...new Set((terms || []).map((term) => String(term).trim()).filter((term) => term.length >= 3))];
}

function HighlightedText({
  text,
  matchedTerms,
  missingTerms,
}: {
  text: string;
  matchedTerms: string[];
  missingTerms: string[];
}) {
  if (!text) return <span className="text-slate-500">No content available.</span>;

  const terms = [
    ...missingTerms.map((term) => ({ term, kind: 'missing' as const })),
    ...matchedTerms.map((term) => ({ term, kind: 'matched' as const })),
  ].sort((a, b) => b.term.length - a.term.length);

  if (terms.length === 0) return <>{text}</>;

  const regex = new RegExp(`\\b(${terms.map(({ term }) => escapeRegex(term)).join('|')})\\b`, 'gi');
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const value = match[0];
    const found = terms.find(({ term }) => term.toLowerCase() === value.toLowerCase());
    const className = found?.kind === 'missing'
      ? 'bg-rose-500/20 text-rose-300 font-semibold px-1 rounded'
      : 'bg-emerald-500/20 text-emerald-300 font-semibold px-1 rounded';
    nodes.push(<span key={`${value}-${match.index}`} className={className}>{value}</span>);
    lastIndex = match.index + value.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return <>{nodes}</>;
}

export function SideBySideComparison({ originalText, generatedText, jdText, matchingSkills, missingSkills }: SideBySideComparisonProps) {
  const matchedTerms = normalizeTerms(matchingSkills);
  const missingTerms = normalizeTerms(missingSkills);
  const rightTitle = generatedText ? 'Generated Resume' : 'Job Description';
  const rightText = generatedText || jdText;

  const diffTerms = generatedText
    ? normalizeTerms(missingTerms.filter((term) => rightText.toLowerCase().includes(term.toLowerCase()) && !originalText.toLowerCase().includes(term.toLowerCase())))
    : missingTerms;

  const removedTerms = generatedText
    ? normalizeTerms(matchedTerms.filter((term) => originalText.toLowerCase().includes(term.toLowerCase()) && !rightText.toLowerCase().includes(term.toLowerCase())))
    : [];

  const legend = generatedText
    ? [
        { label: 'Added or improved', className: 'text-emerald-400', dot: 'bg-emerald-500' },
        { label: 'Still missing', className: 'text-rose-400', dot: 'bg-rose-500' },
      ]
    : [
        { label: 'Matched', className: 'text-emerald-400', dot: 'bg-emerald-500' },
        { label: 'Missing', className: 'text-rose-400', dot: 'bg-rose-500' },
      ];

  const renderText = (text: string, side: 'original' | 'right') => {
    const sideMatched = side === 'right' ? [...matchedTerms, ...diffTerms] : matchedTerms;
    const sideMissing = side === 'right' && !generatedText ? missingTerms : removedTerms;
    return <HighlightedText text={text} matchedTerms={sideMatched} missingTerms={sideMissing} />;
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-200 flex items-center">
          <Layout className="w-4 h-4 mr-2 text-indigo-400" />
          Side-by-Side Analysis
        </h2>
        <div className="flex flex-wrap justify-end gap-3 text-xs font-medium">
          {legend.map((item) => (
            <span key={item.label} className={`flex items-center ${item.className}`}>
              <span className={`w-2 h-2 rounded-full ${item.dot} mr-1.5`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        <div className="p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Original Resume</h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 h-96 overflow-y-auto custom-scrollbar whitespace-pre-wrap pr-2">
            {renderText(originalText, 'original')}
          </div>
        </div>
        
        <div className="p-6 bg-slate-950/20">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">{rightTitle}</h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 h-96 overflow-y-auto custom-scrollbar whitespace-pre-wrap pr-2">
            {renderText(rightText, 'right')}
          </div>
        </div>
      </div>
    </div>
  );
}
