'use client';

import { useState, useEffect } from 'react';
import { listResumesAction } from '@backend/features/resume/actions';
import { FileText, Loader2, Calendar, CheckCircle2 } from 'lucide-react';

interface ResumeSelectorProps {
  onSelect: (resume: any) => void;
  selectedId: string | null;
}

export function ResumeSelector({ onSelect, selectedId }: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResumes() {
      try {
        setLoading(true);
        const data = await listResumesAction();
        setResumes(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load resumes');
      } finally {
        setLoading(false);
      }
    }
    fetchResumes();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-xl border border-slate-800">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading your resumes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
        {error}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-slate-800">
        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-300 font-medium mb-1">No Resumes Found</p>
        <p className="text-slate-500 text-sm">Upload a resume in the Resume AI tool first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resumes.map((resume) => {
        const isSelected = selectedId === resume.id;
        const analysis = resume.latestAnalysis;

        return (
          <div 
            key={resume.id}
            onClick={() => onSelect(resume)}
            className={`relative p-5 rounded-xl cursor-pointer transition-all duration-200 border ${
              isSelected 
                ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800/40'
            }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-indigo-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            
            <div className="flex items-start space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-200'}`}>
                  {resume.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(resume.createdAt).toLocaleDateString()}
                  <span className="mx-2">•</span>
                  v{resume.version}
                </p>
              </div>
            </div>

            {analysis ? (
              <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center text-sm">
                <span className="text-slate-400">Analysis Score</span>
                <span className={`font-bold ${
                  analysis.overallScore >= 80 ? 'text-emerald-400' : 
                  analysis.overallScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {analysis.overallScore}/100
                </span>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-slate-800/50 text-sm text-slate-500 italic">
                No analysis available
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
