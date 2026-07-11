'use client';

import { useState, useEffect } from 'react';
import { History, Cpu, FileText } from 'lucide-react';
import { getResumeAnalysisHistoryAction } from '@backend/features/resume/actions';

interface HistoryTabProps {
  resume: any;
}

export default function HistoryTab({ resume }: HistoryTabProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const data = await getResumeAnalysisHistoryAction(resume.id);
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (resume?.id) fetchHistory();
  }, [resume?.id]);

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 animate-pulse">Loading history...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-slate-800 rounded-3xl bg-slate-900/50">
        <History className="w-16 h-16 text-slate-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-200">No History Found</h3>
        <p className="text-slate-400 mt-2">This resume has not been analyzed yet. Run an analysis to start building history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-violet-400" />
          Previous Analyses History
        </h4>
      </div>

      <div className="grid gap-4">
        {history.map((run, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-800/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-800 rounded-xl">
                <FileText className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h5 className="font-bold text-slate-200 text-sm">Analysis Run {history.length - idx}</h5>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <Cpu className="w-3 h-3" /> Model: {run.modelUsed}
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  {new Date(run.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 font-bold">ATS Score</span>
                <span className={`text-lg font-black ${run.atsScore >= 80 ? 'text-emerald-400' : run.atsScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {run.atsScore}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 font-bold">Semantic</span>
                <span className={`text-lg font-black ${run.semanticScore >= 80 ? 'text-emerald-400' : run.semanticScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {run.semanticScore}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 font-bold">Overall</span>
                <span className={`text-xl font-black ${run.overallScore >= 80 ? 'text-emerald-400' : run.overallScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {run.overallScore}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
