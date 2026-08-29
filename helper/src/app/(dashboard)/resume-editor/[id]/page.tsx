import React from 'react';
import { getResumeJsonAction } from '@backend/features/resume/generatorActions';
import { ResumeEditorWorkspace } from '../../../../components/resume-editor/ResumeEditorWorkspace';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let resumeData = null;
  let errorMessage = '';

  try {
    resumeData = await getResumeJsonAction(id);
  } catch (err: any) {
    errorMessage = err?.message || 'Failed to load resume document.';
  }

  if (!resumeData || !resumeData.json) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="max-w-md w-full space-y-6 bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Unable to Load Resume Editor</h2>
            <p className="text-sm text-slate-400">
              {errorMessage || 'This resume may not exist or does not contain structured content.'}
            </p>
          </div>

          <Link
            href="/resume-studio"
            className="w-full py-3.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Resume Studio</span>
          </Link>
        </div>
      </div>
    );
  }

  // Prisma returns JsonValue — cast to Record since canonicalJson is always an object
  const resumeJson = resumeData.json as Record<string, unknown>;

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden animate-fade-in">
      <ResumeEditorWorkspace
        resumeId={id}
        initialJson={resumeJson}
        version={resumeData.version}
      />
    </div>
  );
}
