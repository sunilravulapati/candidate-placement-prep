'use client';

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Lightbulb,
  Sparkles,
  FileText,
  Clock,
  Flame,
  Award,
  ExternalLink,
  Cpu,
  Layers,
  HelpCircle,
  Code2,
  CheckCircle,
  Zap,
  Tag,
  Building2,
  Terminal,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { WorkspaceProblem } from '@backend/features/liveCoding/types';

interface QuestionPanelProps {
  problem: WorkspaceProblem;
}

export default function QuestionPanel({ problem }: QuestionPanelProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'solution' | 'ai-explain' | 'notes' | 'submissions'>('description');
  const [solutionLang, setSolutionLang] = useState<'ts' | 'cpp' | 'python' | 'java'>('ts');
  const [selectedDriverLang, setSelectedDriverLang] = useState<'python' | 'cpp' | 'java' | 'javascript' | 'typescript'>('python');
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab('description');
  }, [problem.slug]);

  const handleCopyDriver = (lang: string) => {
    const code = problem.inputTemplates?.[lang] || getDefaultDriverTemplate(lang, problem);
    navigator.clipboard.writeText(code);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  const diffColor =
    problem.difficulty === 'EASY'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : problem.difficulty === 'MEDIUM'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Top Tab Bar */}
      <div className="flex border-b border-slate-800 bg-slate-900 px-3 pt-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('description')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap',
            activeTab === 'description' ? 'border-violet-500 text-white bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" /> Description
        </button>
        <button
          onClick={() => setActiveTab('editorial')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap',
            activeTab === 'editorial' ? 'border-violet-500 text-white bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Editorial & Notes
        </button>
        <button
          onClick={() => setActiveTab('solution')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap',
            activeTab === 'solution' ? 'border-violet-500 text-white bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-400" /> Reference Solution
        </button>
        <button
          onClick={() => setActiveTab('ai-explain')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap',
            activeTab === 'ai-explain' ? 'border-violet-500 text-violet-300 bg-violet-500/10' : 'border-transparent text-violet-400/70 hover:text-violet-300'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" /> AI Tutor
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            'px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap',
            activeTab === 'notes' ? 'border-violet-500 text-white bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'
          )}
        >
          <FileText className="w-3.5 h-3.5" /> Notes
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'description' && (
          <div className="space-y-6">
            {/* Header Metadata Section */}
            <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-slate-400">#{problem.questionNo || 1}</span>
                  <h1 className="text-xl font-bold text-white tracking-tight">{problem.title}</h1>
                </div>
                <span className={`px-2.5 py-1 rounded-full border text-xs font-bold font-mono ${diffColor}`}>
                  {problem.difficulty}
                </span>
              </div>

              {/* Badges Grid */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                {problem.importance && (
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Award className="w-3 h-3" /> Importance {problem.importance}
                  </span>
                )}
                {problem.interviewFrequency && (
                  <span className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Flame className="w-3 h-3" /> {problem.interviewFrequency} Frequency
                  </span>
                )}
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> ~{problem.estimatedSolveTime || `${problem.estimatedTime} mins`}
                </span>
                {problem.pattern && (
                  <span className="bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 rounded font-medium">
                    Pattern: {problem.pattern}
                  </span>
                )}
                {problem.technique && (
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-medium">
                    Technique: {problem.technique}
                  </span>
                )}
              </div>

              {/* Companies */}
              {problem.companies && problem.companies.length > 0 && (
                <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-slate-300">Companies:</span>
                  <div className="flex flex-wrap gap-1">
                    {problem.companies.slice(0, 6).map((comp) => (
                      <span key={comp.slug} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                        {comp.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section: Pattern Recognition */}
            {problem.recognitionClues && (
              <div className="bg-gradient-to-r from-violet-950/40 to-slate-900 border border-violet-800/30 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" /> Pattern Recognition & Trigger Clues
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">{problem.recognitionClues}</p>
                {problem.keywords && problem.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-violet-400">Trigger Keywords:</span>
                    {problem.keywords.map((kw) => (
                      <span key={kw} className="bg-violet-900/40 text-violet-200 border border-violet-700/50 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section: Data Structures Used */}
            {problem.dataStructuresUsed && problem.dataStructuresUsed.length > 0 && (
              <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-300">Data Structures Used:</span>
                <div className="flex flex-wrap gap-1.5">
                  {problem.dataStructuresUsed.map((ds) => (
                    <span key={ds} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono text-[11px]">
                      {ds}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Problem Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Problem Description</h3>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                {problem.description}
              </div>
            </div>

            {/* Pedagogical Context: Why Learn This, Prerequisites, Concepts */}
            {(problem.whyLearnThis || problem.prerequisites || problem.concepts) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {problem.whyLearnThis && (
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <span className="font-bold text-indigo-400 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Why Learn This?
                    </span>
                    <p className="text-slate-300 leading-normal">{problem.whyLearnThis}</p>
                  </div>
                )}
                {problem.prerequisites && (
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Prerequisites
                    </span>
                    <p className="text-slate-300 leading-normal">{problem.prerequisites}</p>
                  </div>
                )}
                {problem.concepts && (
                  <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Core Concepts
                    </span>
                    <p className="text-slate-300 leading-normal">{problem.concepts}</p>
                  </div>
                )}
              </div>
            )}

            {/* Visible Test Cases */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Visible Test Cases
              </h3>
              <div className="space-y-3">
                {(problem.examples || []).map((ex, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400 font-sans font-bold border-b border-slate-800 pb-1.5 text-[11px]">
                      <span>Example {idx + 1}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <span className="text-slate-200">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Output: </span>
                      <span className="text-emerald-400 font-bold">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-slate-400 font-sans text-[11px] pt-1">
                        <span className="font-semibold text-slate-300">Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hints Section (Collapsible) */}
            {problem.hints && problem.hints.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Progressive Hints
                </h3>
                <div className="space-y-2">
                  {problem.hints.map((hint, idx) => (
                    <details key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
                      <summary className="cursor-pointer p-3 text-xs font-bold text-slate-300 hover:text-white transition-colors flex justify-between items-center bg-slate-900/90">
                        <span>Hint {idx + 1}</span>
                        <span className="text-[10px] text-violet-400 font-mono group-open:hidden">Click to reveal</span>
                      </summary>
                      <div className="p-3 pt-2 text-xs text-slate-300 border-t border-slate-800 bg-slate-950/60 leading-relaxed">
                        {hint}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Complexity Matrix Section */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" /> Complexity Matrix
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900 border border-emerald-500/20 p-3 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold font-sans text-[11px] uppercase block">Optimal Complexity</span>
                  <div className="text-slate-300">Time: <span className="text-emerald-300 font-bold">{problem.optimalTC || problem.timeComplexity || 'O(N)'}</span></div>
                  <div className="text-slate-300">Space: <span className="text-emerald-300 font-bold">{problem.optimalSC || problem.spaceComplexity || 'O(1)'}</span></div>
                </div>
                <div className="bg-slate-900 border border-amber-500/20 p-3 rounded-xl space-y-1">
                  <span className="text-amber-400 font-bold font-sans text-[11px] uppercase block">Brute Force Baseline</span>
                  <div className="text-slate-300">Time: <span className="text-amber-300">{problem.bruteTC || 'O(N^2)'}</span></div>
                  <div className="text-slate-300">Space: <span className="text-amber-300">{problem.bruteSC || 'O(1)'}</span></div>
                </div>
              </div>
            </div>

            {/* Extensible Resource Links */}
            {problem.resources && problem.resources.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice External Resources</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span className="capitalize">{res.type}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Language Input Driver & Code Template Section */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-400" />
                  <span>Language Input Driver & Code Templates</span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  If running in a custom runner or local IDE and output is empty, copy the stdin driver template for your language below:
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between bg-slate-950 px-3 py-2 border-b border-slate-800 text-xs">
                  <div className="flex gap-1 font-mono text-[11px]">
                    {(['python', 'cpp', 'java', 'javascript', 'typescript'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setSelectedDriverLang(lang)}
                        className={cn(
                          'px-2.5 py-1 rounded font-semibold uppercase transition-all',
                          selectedDriverLang === lang
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        )}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : lang === 'javascript' ? 'JS' : lang === 'typescript' ? 'TS' : 'Java'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopyDriver(selectedDriverLang)}
                    className="flex items-center gap-1 text-[11px] font-medium text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 px-2.5 py-1 rounded-lg border border-violet-500/20 transition-colors"
                  >
                    {copiedLang === selectedDriverLang ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLang === selectedDriverLang ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="p-4 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 bg-slate-950/70">
                  <pre className="whitespace-pre">
                    {problem.inputTemplates?.[selectedDriverLang] || getDefaultDriverTemplate(selectedDriverLang, problem)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'editorial' && (
          <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
            {problem.editorial ? (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl whitespace-pre-wrap font-sans space-y-4">
                {problem.editorial}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-white">Intuition</h3>
                  <p>{problem.intuition || 'Break down the problem by identifying optimal sub-structures and invariant properties.'}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <h3 className="text-sm font-bold text-white">Approach</h3>
                  <p>{problem.approach || 'Utilize standard algorithmic patterns.'}</p>
                </div>

                {problem.pseudocode && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h3 className="text-sm font-bold text-white">Pseudocode</h3>
                    <pre className="bg-slate-950 p-3 rounded-lg font-mono text-slate-300 text-[11px] overflow-x-auto">
                      {problem.pseudocode}
                    </pre>
                  </div>
                )}

                {problem.interviewTrick && (
                  <div className="bg-indigo-950/30 border border-indigo-800/40 p-4 rounded-xl space-y-1">
                    <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" /> Interview Trick & Pro-Tip
                    </h3>
                    <p>{problem.interviewTrick}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'solution' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <span className="text-xs font-bold text-white">Reference Solution Implementation</span>
              <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                {(['ts', 'cpp', 'python', 'java'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSolutionLang(lang)}
                    className={cn(
                      'px-2.5 py-1 rounded font-semibold uppercase transition-colors',
                      solutionLang === lang ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto">
              <pre>
                {`// Trusted Reference Solution for ${problem.title} (${solutionLang.toUpperCase()})
// Pattern: ${problem.pattern || 'Optimal Algorithm'}
// Time Complexity: ${problem.optimalTC || 'O(N)'} | Space Complexity: ${problem.optimalSC || 'O(1)'}

${problem.pseudocode || '// Reference code stub\nfunction solve() {\n  return 0;\n}'}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'ai-explain' && (
          <div className="text-slate-400 text-center py-12 space-y-4">
            <Sparkles className="w-12 h-12 text-violet-500 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-white">AI Pedagogical Tutor</h3>
            <p className="max-w-md mx-auto text-xs text-slate-400">
              Need personalized guidance? Our AI tutor can explain intuition step-by-step, generate custom dry-runs, or clarify constraints.
            </p>
            <button className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs rounded-xl transition-colors">
              Explain Problem Intuition
            </button>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col h-full space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Personal Revision Notes</h3>
            <textarea
              className="flex-1 w-full min-h-[220px] bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none font-mono"
              placeholder="Record edge cases, interview tricks, or your thoughts here..."
            />
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold transition-colors">
                Save Notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultDriverTemplate(lang: string, problem: WorkspaceProblem) {
  const title = problem.title;
  const topic = problem.primaryTopic || 'DSA';
  const qNo = (problem as any).questionNo || 1;

  if (lang === 'python') {
    return `# --- ${qNo}. ${title} (${topic}) ---
def solution(inputs):
    # Function implementation
    pass

if __name__ == "__main__":
    import sys
    # Sample Input: adjust according to problem requirements
    raw_input = sys.stdin.read().splitlines() if not sys.stdin.isatty() else ["sample_input_1", "sample_input_2"]
    print(f"Input: {raw_input}")
    # result = solution(raw_input)
    # print(f"Output: {result}")`;
  }
  if (lang === 'cpp') {
    return `// --- ${qNo}. ${title} (${topic}) ---
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

class Solution {
public:
    void solve() {
        // Implement driver and input logic
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    Solution sol;
    sol.solve();
    return 0;
}`;
  }
  if (lang === 'java') {
    return `// --- ${qNo}. ${title} (${topic}) ---
import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Parse input here
        System.out.println("Ready for input: " + "${title}");
    }
}`;
  }
  if (lang === 'javascript') {
    return `// --- ${qNo}. ${title} (${topic}) ---
const fs = require('fs');

function solve(input) {
  // Implement standard logic
  return input;
}

const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
console.log(solve(input));`;
  }
  return `// --- ${qNo}. ${title} (${topic}) ---
import * as fs from 'fs';

function solveTS(inputData: string[]): any {
  // Implement TypeScript logic
  return inputData;
}

const rawData: string[] = fs.readFileSync(0, 'utf-8').trim().split('\\n');
console.log(solveTS(rawData));`;
}
