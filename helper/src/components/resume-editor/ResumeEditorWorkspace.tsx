'use client';

import React, { useState } from 'react';
import { EditorTabs } from './EditorTabs';
import { SectionEditor } from './SectionEditor';
import { DiffEngine } from './DiffEngine';
import { HtmlRenderer } from './HtmlRenderer';
import { updateResumeJsonAction } from '@backend/features/resume/generatorActions';
import { Check, Save } from 'lucide-react';

export function ResumeEditorWorkspace({ resumeId, initialJson }: { resumeId: string, initialJson: any }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [resumeJson, setResumeJson] = useState<any>(initialJson);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateResumeJsonAction(resumeId, resumeJson);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to save');
    }
    setIsSaving(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8 relative">
        <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg min-h-[800px]">
          {activeTab === 'preview' ? (
            <HtmlRenderer resumeJson={resumeJson} />
          ) : activeTab === 'diff' ? (
            <DiffEngine originalJson={initialJson} currentJson={resumeJson} />
          ) : (
            <SectionEditor 
              section={activeTab} 
              data={resumeJson[activeTab] || resumeJson.personalInfo} 
              onChange={(newData: any) => setResumeJson({ ...resumeJson, [activeTab]: newData })} 
            />
          )}
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-8 right-8">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition font-medium"
          >
            {isSaving ? (
              <span className="animate-pulse">Saving...</span>
            ) : showSaved ? (
              <><Check className="w-5 h-5" /> Saved</>
            ) : (
              <><Save className="w-5 h-5" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
