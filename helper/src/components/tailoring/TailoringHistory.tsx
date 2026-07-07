'use client';

import React, { useState, useEffect } from 'react';
import { getTailoringHistoryAction } from '@backend/features/resume/actions';
import { History, Loader2, Target, Calendar, ChevronRight } from 'lucide-react';

interface TailoringHistoryProps {
  resumeId: string;
  onSelectSession: (sessionId: string) => void;
}

export function TailoringHistory({ resumeId, onSelectSession }: TailoringHistoryProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!resumeId) return;
      try {
        setLoading(true);
        const data = await getTailoringHistoryAction(resumeId);
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load tailoring history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 border border-slate-800 rounded-xl bg-slate-900/30">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mr-3" />
        <span className="text-slate-400 text-sm">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/30">
        <History className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-300 font-medium text-sm">No tailoring history found</p>
        <p className="text-slate-500 text-xs mt-1">Start a new tailoring session below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Previous Sessions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((session) => (
          <div 
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className="p-4 border border-slate-800 bg-slate-900/50 rounded-xl cursor-pointer hover:border-indigo-500/50 transition-colors group"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-bold text-slate-200 line-clamp-1">{session.jobDescription?.role || 'Unknown Role'}</p>
                <p className="text-xs text-slate-400">{session.jobDescription?.company || 'Unknown Company'}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-sm font-extrabold ${session.matchScore >= 80 ? 'text-emerald-400' : session.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {session.matchScore}%
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Match</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800/50">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(session.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center text-indigo-400/0 group-hover:text-indigo-400 transition-colors">
                Open <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
