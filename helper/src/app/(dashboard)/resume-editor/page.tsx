// src/app/(dashboard)/resume-editor/page.tsx
import React from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@backend/auth/session';
import { ResumeRepository } from '@backend/features/resume/repository';
import Link from 'next/link';
import { Edit3, FileText, ArrowRight, Sparkles } from 'lucide-react';

export default async function ResumeEditorIndexPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Find the user's latest resume
  const resumes = await ResumeRepository.findManyByUser(user.id);

  if (resumes && resumes.length > 0) {
    // Redirect to the latest resume's editor page
    const latestResume = resumes[0];
    redirect(`/resume-editor/${latestResume.id}`);
  }

  // If no resumes exist, display an interactive launcher
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-md w-full space-y-6 bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
          <Edit3 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No Resumes Found for Editing</h2>
          <p className="text-sm text-slate-400">
            Upload your resume or create one in Resume Studio to access the live structured editor.
          </p>
        </div>

        <Link
          href="/resume-studio"
          className="w-full py-3.5 px-6 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-900/30 transition-all"
        >
          <span>Go to Resume Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
