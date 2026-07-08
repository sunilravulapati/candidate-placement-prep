import React from 'react';
import { getResumeJsonAction } from '@backend/features/resume/generatorActions';
import { ResumeEditorWorkspace } from '../../../../components/resume-editor/ResumeEditorWorkspace';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ResumeEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let resumeData;
  try {
    resumeData = await getResumeJsonAction(id);
  } catch {
    redirect('/resume-tailoring');
  }

  if (!resumeData.json) {
    redirect('/resume-tailoring');
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full min-w-0 flex-col -m-4 md:-m-8">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="min-w-0">
          <Link
            href="/resume-tailoring"
            className="mb-1 inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-violet-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Tailoring
          </Link>
          <h1 className="truncate text-lg font-bold text-slate-100 md:text-xl">Resume Editor</h1>
        </div>
      </div>
      <ResumeEditorWorkspace resumeId={id} initialJson={resumeData.json} version={resumeData.version} />
    </div>
  );
}
