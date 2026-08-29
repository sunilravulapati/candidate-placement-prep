'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  FileJson,
  Edit3,
  BarChart2,
  Cpu,
  Clock,
  Layers,
  Download,
  Sparkles,
} from 'lucide-react';
import { HtmlRenderer } from '../resume-editor/HtmlRenderer';
import { TemplateId } from '../resume-editor/templates/types';
import { cn } from '@/lib/cn';

interface GeneratedResumePreviewProps {
  resumeJson: any;
  version?: number;
  resumeId?: string | null;
  generationMetadata?: {
    model?: string;
    timestamp?: string;
    sessionId?: string;
    promptVersion?: string;
    sourceResumeId?: string;
  } | null;
}

export function GeneratedResumePreview({
  resumeJson,
  version,
  resumeId,
  generationMetadata,
}: GeneratedResumePreviewProps) {
  const [templateId, setTemplateId] = useState<TemplateId>('modern');

  if (!resumeJson) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center">
        <FileJson className="mx-auto mb-3 h-10 w-10 text-slate-600" />
        <p className="text-sm font-semibold text-slate-300">Generated resume preview will appear here</p>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Accept recommendations above and click &quot;Generate Resume&quot; to produce your tailored ATS version.
        </p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-800/30 bg-slate-900/50 shadow-2xl backdrop-blur-md">
      {/* Header toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Tailored ATS Resume</span>
            {version && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                <Layers className="h-3 w-3" />
                v{version}
              </span>
            )}
          </div>
          {/* Generation metadata */}
          {generationMetadata && (
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
              {generationMetadata.model && (
                <span className="flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  {generationMetadata.model}
                </span>
              )}
              {generationMetadata.timestamp && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(generationMetadata.timestamp).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Template Selector */}
          <div className="flex rounded-xl border border-slate-800 bg-slate-950 p-0.5">
            {(['modern', 'classic', 'minimal'] as TemplateId[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTemplateId(t)}
                className={cn(
                  'px-2.5 py-1 text-xs font-semibold rounded-lg capitalize transition-all',
                  templateId === t
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {t === 'modern' ? 'Tech' : t === 'classic' ? 'Classic' : 'Minimal'}
              </button>
            ))}
          </div>

          {/* Export PDF Button (Active) */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            title="Download PDF"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </button>

          {resumeId && (
            <>
              {/* Open in editor */}
              <Link
                href={`/resume-editor/${resumeId}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Link>

              {/* Analyze this version */}
              <Link
                href={`/resume-studio?resumeId=${resumeId}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/20"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                <span>Score</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Styled Resume Preview Body */}
      <div className="max-h-[50rem] overflow-y-auto p-4 sm:p-6 custom-scrollbar flex justify-center bg-slate-950/70">
        <div className="w-full max-w-[210mm] shadow-2xl rounded-sm">
          <HtmlRenderer
            resumeJson={resumeJson}
            templateId={templateId}
            density="standard"
            paperSize="a4"
          />
        </div>
      </div>
    </div>
  );
}
