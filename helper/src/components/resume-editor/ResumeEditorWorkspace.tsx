'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import { updateResumeJsonAction } from '@backend/features/resume/generatorActions';
import { Check, Save, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, ErrorCard } from '@/components/ui';

const EditorTabs = dynamic(() => import('./EditorTabs').then((m) => ({ default: m.EditorTabs })), {
  loading: () => <div className="animate-pulse p-4 space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-slate-800 rounded-lg" />)}</div>,
});

const SectionEditor = dynamic(() => import('./SectionEditor').then((m) => ({ default: m.SectionEditor })));
const DiffEngine = dynamic(() => import('./DiffEngine').then((m) => ({ default: m.DiffEngine })));
const HtmlRenderer = dynamic(() => import('./HtmlRenderer').then((m) => ({ default: m.HtmlRenderer })));

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unsaved';

export const ResumeEditorWorkspace = memo(function ResumeEditorWorkspace({
  resumeId,
  initialJson,
  version,
}: {
  resumeId: string;
  initialJson: Record<string, unknown>;
  version?: number;
}) {
  const [activeTab, setActiveTab] = useState('summary');
  const [resumeJson, setResumeJson] = useState(initialJson);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await updateResumeJsonAction(resumeId, resumeJson);
      isDirtyRef.current = false;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2500);
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  }, [resumeId, resumeJson]);

  const scheduleAutosave = useCallback(() => {
    isDirtyRef.current = true;
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  }, [handleSave]);

  const handleChange = useCallback(
    (newData: unknown) => {
      setResumeJson((prev) => {
        const next = { ...prev, [activeTab]: newData };
        return next;
      });
      scheduleAutosave();
    },
    [activeTab, scheduleAutosave]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [handleSave]);

  const statusLabel = {
    idle: null,
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    saved: 'All changes saved',
    error: 'Save failed',
  }[saveStatus];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium text-slate-400 truncate">
            Version {version ?? 1}
          </span>
          {statusLabel && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium',
                saveStatus === 'saved' && 'text-emerald-400',
                saveStatus === 'saving' && 'text-violet-400',
                saveStatus === 'unsaved' && 'text-amber-400',
                saveStatus === 'error' && 'text-rose-400'
              )}
            >
              {saveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
              {saveStatus === 'saved' && <Check className="h-3 w-3" />}
              {saveStatus === 'unsaved' && <CloudOff className="h-3 w-3" />}
              {saveStatus === 'idle' && <Cloud className="h-3 w-3 text-slate-600" />}
              {statusLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-600 sm:inline">⌘S to save</span>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            variant={saveStatus === 'saved' ? 'success' : 'primary'}
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950/50 md:block lg:w-64">
          <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md overflow-x-auto">
          <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab} compact />
        </div>

        {/* Main editor */}
        <div className="flex-1 overflow-y-auto bg-[#030712] p-4 md:p-8 pb-24 md:pb-8">
          {saveError && (
            <ErrorCard type="database" message={saveError} onRetry={handleSave} className="mb-4 max-w-4xl mx-auto" />
          )}
          <div className="mx-auto max-w-4xl min-h-[600px] rounded-2xl border border-slate-800 bg-slate-900/40 shadow-xl">
            {activeTab === 'preview' ? (
              <HtmlRenderer resumeJson={resumeJson} />
            ) : activeTab === 'diff' ? (
              <DiffEngine originalJson={initialJson} currentJson={resumeJson} />
            ) : (
              <SectionEditor
                section={activeTab}
                data={resumeJson[activeTab] ?? resumeJson.personalInfo}
                onChange={handleChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
