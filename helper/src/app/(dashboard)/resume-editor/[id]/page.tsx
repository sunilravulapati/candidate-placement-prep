import React from 'react';
import { getResumeJsonAction } from '@backend/features/resume/generatorActions';
import { ResumeEditorWorkspace } from '../../../../components/resume-editor/ResumeEditorWorkspace';
import { redirect } from 'next/navigation';

export default async function ResumeEditorPage({ params }: { params: { id: string } }) {
  let resumeData;
  try {
    resumeData = await getResumeJsonAction(params.id);
  } catch (err) {
    redirect('/resume-tailoring');
  }

  if (!resumeData.json) {
    // If somehow it doesn't have JSON, go back to tailoring.
    redirect('/resume-tailoring');
  }

  return (
    <div className="w-full h-full min-h-screen bg-gray-50 flex flex-col">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Editor Workspace</h1>
          <p className="text-gray-500 text-sm">Version {resumeData.version} • Canonical JSON</p>
        </div>
      </div>
      <ResumeEditorWorkspace resumeId={params.id} initialJson={resumeData.json} />
    </div>
  );
}
