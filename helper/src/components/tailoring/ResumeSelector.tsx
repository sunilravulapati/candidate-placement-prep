'use client';

import { useState, useEffect, memo } from 'react';
import { listResumesAction } from '@backend/features/resume/actions';
import { FileText, Calendar, CheckCircle2 } from 'lucide-react';
import { SkeletonList, ErrorCard } from '@/components/ui';

interface ResumeSelectorProps {
  onSelect: (resume: Record<string, unknown>) => void;
  selectedId: string | null;
}

export const ResumeSelector = memo(function ResumeSelector({ onSelect, selectedId }: ResumeSelectorProps) {
  const [resumes, setResumes] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listResumesAction()
      .then(setResumes)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load resumes'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <SkeletonList count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorCard type="network" message={error} onRetry={() => window.location.reload()} />;
  }

  if (resumes.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-slate-600" />
        <p className="mb-1 font-medium text-slate-300">No Resumes Found</p>
        <p className="text-sm text-slate-500">Upload a resume in the Resume AI tool first.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {resumes.map((resume) => {
        const isSelected = selectedId === resume.id;
        const analysis = resume.latestAnalysis as { overallScore?: number } | null;

        return (
          <button
            key={resume.id as string}
            type="button"
            onClick={() => onSelect(resume)}
            className={`relative rounded-xl border p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 ${
              isSelected
                ? 'border-indigo-500/50 bg-indigo-900/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/40'
            }`}
          >
            {isSelected && (
              <div className="absolute right-3 top-3 text-indigo-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}

            <div className="mb-3 flex items-start space-x-3">
              <div className={`rounded-lg p-2 ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className={`font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-200'}`}>
                  {resume.name as string}
                </h4>
                <p className="mt-1 flex items-center text-xs text-slate-500">
                  <Calendar className="mr-1 h-3 w-3" />
                  {new Date(resume.createdAt as string).toLocaleDateString()}
                  <span className="mx-2">&bull;</span>
                  v{resume.version as number}
                </p>
              </div>
            </div>

            {analysis ? (
              <div className="mt-3 flex items-center justify-between border-t border-slate-800/50 pt-3 text-sm">
                <span className="text-slate-400">Analysis Score</span>
                <span
                  className={`font-bold ${
                    (analysis.overallScore ?? 0) >= 80
                      ? 'text-emerald-400'
                      : (analysis.overallScore ?? 0) >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {analysis.overallScore}/100
                </span>
              </div>
            ) : (
              <div className="mt-3 border-t border-slate-800/50 pt-3 text-sm italic text-slate-500">
                No analysis available
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
});
