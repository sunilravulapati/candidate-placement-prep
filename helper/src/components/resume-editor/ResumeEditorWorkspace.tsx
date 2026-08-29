'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { updateResumeJsonAction } from '@backend/features/resume/generatorActions';
import {
  Check,
  Save,
  Cloud,
  CloudOff,
  Loader2,
  Download,
  Eye,
  Edit3,
  AlertTriangle,
  Sliders,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, ErrorCard } from '@/components/ui';
import { TemplateId, Density, PaperSize } from './templates/types';
import { EditorTabs } from './EditorTabs';
import { SectionEditor } from './SectionEditor';
import { HtmlRenderer } from './HtmlRenderer';

const DiffEngine = dynamic(() => import('./DiffEngine').then((m) => ({ default: m.DiffEngine })), {
  loading: () => <div className="p-8 text-center text-slate-500 animate-pulse">Loading version diff...</div>,
});

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'unsaved';

interface ResumeEditorWorkspaceProps {
  resumeId: string;
  initialJson: Record<string, unknown>;
  version?: number;
}

export const ResumeEditorWorkspace = memo(function ResumeEditorWorkspace({
  resumeId,
  initialJson,
  version,
}: ResumeEditorWorkspaceProps) {
  const [activeTab, setActiveTab] = useState('personalInfo');
  const [resumeJson, setResumeJson] = useState(initialJson);
  const [templateId, setTemplateId] = useState<TemplateId>('modern');
  const [density, setDensity] = useState<Density>('standard');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);

  // Page Overflow Detection refs & state
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [overflowInfo, setOverflowInfo] = useState<{
    pageCount: number;
    overflowPx: number;
    overflowLines: number;
    isOverOnePage: boolean;
  }>({
    pageCount: 1,
    overflowPx: 0,
    overflowLines: 0,
    isOverOnePage: false,
  });

  // Calculate overflow whenever resumeJson, template, density, or paperSize changes
  useEffect(() => {
    const checkOverflow = () => {
      const el = previewContainerRef.current;
      if (!el) return;

      const renderedHeight = el.scrollHeight;
      // Standard 1 page height at 96 DPI: A4 is ~1123px (297mm), Letter is ~1056px (11in)
      const standardPageHeight = paperSize === 'letter' ? 1056 : 1123;

      if (renderedHeight > standardPageHeight + 10) {
        const extraPx = renderedHeight - standardPageHeight;
        const estLines = Math.ceil(extraPx / 20);
        setOverflowInfo({
          pageCount: Math.ceil(renderedHeight / standardPageHeight),
          overflowPx: extraPx,
          overflowLines: estLines,
          isOverOnePage: true,
        });
      } else {
        setOverflowInfo({
          pageCount: 1,
          overflowPx: 0,
          overflowLines: 0,
          isOverOnePage: false,
        });
      }
    };

    const timer = setTimeout(checkOverflow, 200);
    return () => clearTimeout(timer);
  }, [resumeJson, templateId, density, paperSize]);

  // Handle Save
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
    }, 1800);
  }, [handleSave]);

  const handleSectionChange = useCallback(
    (newData: unknown) => {
      setResumeJson((prev) => {
        const next = { ...prev, [activeTab]: newData };
        return next;
      });
      scheduleAutosave();
    },
    [activeTab, scheduleAutosave]
  );

  // Keyboard shortcut for Cmd+S / Ctrl+S
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  // Print / Export PDF trigger
  const handlePrint = () => {
    window.print();
  };

  const statusLabel = {
    idle: null,
    unsaved: 'Unsaved changes',
    saving: 'Saving...',
    saved: 'All changes saved',
    error: 'Save failed',
  }[saveStatus];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Sticky Main Header Toolbar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/90 px-4 py-2.5 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/resume-studio"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-violet-400" />
            <span>Studio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-200">
              Version {version ?? 1}
            </span>
            <span className="rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-400 uppercase tracking-wider">
              Canonical
            </span>
          </div>

          {statusLabel && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-medium pl-2 border-l border-slate-800',
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
              <span>{statusLabel}</span>
            </span>
          )}
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mobile view toggle */}
          <div className="flex lg:hidden rounded-xl border border-slate-800 bg-slate-900 p-0.5">
            <button
              type="button"
              onClick={() => setMobileView('editor')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all',
                mobileView === 'editor'
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setMobileView('preview')}
              className={cn(
                'flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all',
                mobileView === 'preview'
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
          </div>

          <span className="hidden text-xs text-slate-500 xl:inline">⌘S to save</span>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            variant={saveStatus === 'saved' ? 'success' : 'primary'}
            className="rounded-xl px-4 font-bold text-xs"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>{saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
          </Button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            title="Download vector ATS PDF via Browser Print"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Workspace */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Leftmost Section Tabs Navigation (Desktop) */}
        <aside className="hidden w-44 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950/70 md:block lg:w-48">
          <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </aside>

        {/* Center / Left Pane: Active Section Form Editor */}
        <div
          className={cn(
            'flex-1 overflow-y-auto border-r border-slate-800/80 bg-slate-900/20 p-3 sm:p-5 lg:p-6 pb-20 md:pb-8 custom-scrollbar',
            mobileView === 'preview' ? 'hidden lg:block' : 'block'
          )}
        >
          {/* Mobile Bottom Tabs */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md">
            <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab} compact />
          </div>

          <div className="w-full max-w-4xl mx-auto space-y-4">
            {saveError && (
              <ErrorCard
                type="database"
                message={saveError}
                onRetry={handleSave}
                className="mb-4"
              />
            )}

            <div className="rounded-3xl border border-slate-800/90 bg-slate-950/70 shadow-2xl backdrop-blur-md">
              {activeTab === 'diff' ? (
                <div className="p-6">
                  <DiffEngine originalJson={initialJson} currentJson={resumeJson} />
                </div>
              ) : (
                <SectionEditor
                  section={activeTab}
                  data={resumeJson[activeTab] ?? (activeTab === 'personalInfo' ? resumeJson.personalInfo || {} : null)}
                  onChange={handleSectionChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: Live Resume Preview + Template Controls */}
        <div
          className={cn(
            'flex-1 flex-col overflow-y-auto bg-slate-950/95 p-3 sm:p-5 pb-24 md:pb-8 custom-scrollbar',
            mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
          )}
        >
          {/* Preview Customization Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-2.5 backdrop-blur-md">
            {/* Template Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Template:
              </span>
              <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-0.5">
                {(['modern', 'classic', 'minimal'] as TemplateId[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplateId(t)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all',
                      templateId === t
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {t === 'modern' ? 'Modern Tech' : t === 'classic' ? 'Classic' : 'Minimal ATS'}
                  </button>
                ))}
              </div>
            </div>

            {/* Density Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Density:
              </span>
              <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-0.5">
                {(['compact', 'standard', 'relaxed'] as Density[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDensity(d)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all',
                      density === d
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Size & Zoom Scale */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-0.5">
                {(['a4', 'letter'] as PaperSize[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPaperSize(p)}
                    className={cn(
                      'px-2 py-0.5 text-xs font-semibold rounded-lg uppercase transition-all',
                      paperSize === p
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Zoom controls */}
              <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-2 py-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.7, +(z - 0.1).toFixed(1)))}
                  className="text-slate-400 hover:text-slate-200 p-0.5"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-300 px-1">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(1.2, +(z + 0.1).toFixed(1)))}
                  className="text-slate-400 hover:text-slate-200 p-0.5"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Page Overflow Warning & "Fit to 1 Page" Assistant */}
          {overflowInfo.isOverOnePage && (
            <div className="mb-3 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-2 animate-fade-in backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Resume spans {overflowInfo.pageCount} pages (~{overflowInfo.overflowLines} lines overflow onto Page 2)
                  </span>
                </div>
                {density !== 'compact' && (
                  <button
                    type="button"
                    onClick={() => setDensity('compact')}
                    className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
                  >
                    <Sliders className="w-3 h-3" />
                    Try Compact Density
                  </button>
                )}
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                <strong>Suggestions to fit 1 page:</strong> Switch density to <em>Compact</em>, shorten verbose bullet points, or remove older low-impact experiences.
              </p>
            </div>
          )}

          {/* Live Document Preview Card */}
          <div className="flex-1 flex justify-center items-start overflow-auto p-1">
            <div
              className="w-full max-w-[210mm] transition-transform"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                marginBottom: `${(zoomScale - 1) * 300}px`,
              }}
            >
              <HtmlRenderer
                ref={previewContainerRef}
                resumeJson={resumeJson}
                templateId={templateId}
                density={density}
                paperSize={paperSize}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
