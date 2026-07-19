'use client';

import React from 'react';
import { History, CheckCircle2, XCircle, Clock, Cpu } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export default function SubmissionHistoryPage() {
  const submissions = [
    { id: '1', problem: 'Two Sum', status: 'Accepted', lang: 'TypeScript', runtime: '65 ms', memory: '44.5 MB', time: '2 hours ago' },
    { id: '2', problem: 'LRU Cache', status: 'Wrong Answer', lang: 'Python', runtime: 'N/A', memory: 'N/A', time: '5 hours ago' },
    { id: '3', problem: 'Merge K Sorted Lists', status: 'Time Limit Exceeded', lang: 'C++', runtime: 'N/A', memory: 'N/A', time: '1 day ago' },
    { id: '4', problem: 'Valid Palindrome', status: 'Accepted', lang: 'JavaScript', runtime: '55 ms', memory: '42.1 MB', time: '2 days ago' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <History className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Submission History</h1>
            <p className="text-slate-400">Review your past solutions and AI feedback.</p>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="p-4 font-semibold text-slate-400">Time Submitted</th>
                <th className="p-4 font-semibold text-slate-400">Question</th>
                <th className="p-4 font-semibold text-slate-400">Status</th>
                <th className="p-4 font-semibold text-slate-400">Runtime</th>
                <th className="p-4 font-semibold text-slate-400">Memory</th>
                <th className="p-4 font-semibold text-slate-400">Language</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr key={sub.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-slate-400">{sub.time}</td>
                  <td className="p-4 font-medium text-slate-200">{sub.problem}</td>
                  <td className="p-4">
                    <span className={cn(
                      "flex items-center gap-2 font-semibold",
                      sub.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                    )}>
                      {sub.status === 'Accepted' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> {sub.runtime}
                  </td>
                  <td className="p-4 text-slate-400">
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4" /> {sub.memory}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-800 rounded text-sm text-slate-300 border border-slate-700">
                      {sub.lang}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}
