'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, FileJson, Edit3, BarChart2, Cpu, Clock, Layers, Download } from 'lucide-react';

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-800/70 pb-4 last:border-b-0 last:pb-0">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      {children}
    </section>
  );
}

function skillEntries(skills: any) {
  if (!skills || typeof skills !== 'object') return [];
  return Object.entries(skills).filter(([, value]) => Array.isArray(value) && (value as any[]).length > 0);
}

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
  if (!resumeJson) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
        <FileJson className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium text-slate-300">Generated resume preview will appear here</p>
        <p className="mt-1 text-xs text-slate-500">
          Accept recommendations above and click Generate Resume.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-800/30 bg-slate-900/50">
      {/* Header toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FileJson className="h-4 w-4 text-emerald-400" />
            Generated Resume
            {version && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
                <Layers className="h-3 w-3" />
                Version {version}
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
              {generationMetadata.promptVersion && (
                <span>Prompt v{generationMetadata.promptVersion}</span>
              )}
            </div>
          )}
        </div>

        {resumeId && (
          <div className="flex items-center gap-2 shrink-0">
            {/* Generate PDF placeholder */}
            <button
              disabled
              title="PDF export will be available in Resume Studio v2"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-slate-400 opacity-50 cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              Generate PDF (Coming Soon)
            </button>
            {/* Open in editor */}
            <Link
              href={`/resume-editor/${resumeId}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/20"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Link>
            {/* Analyze this version */}
            <Link
              href={`/resume-studio?resumeId=${resumeId}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition-colors hover:bg-violet-500/20"
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Analyze
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Resume content */}
      <div className="max-h-[42rem] space-y-5 overflow-y-auto p-5 custom-scrollbar">
        {/* Header */}
        <div className="border-b border-slate-800/70 pb-4 text-center">
          <h2 className="text-2xl font-bold text-slate-100">
            {resumeJson.personalInfo?.fullName || 'Generated Resume'}
          </h2>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
            {resumeJson.personalInfo?.email && <span>{resumeJson.personalInfo.email}</span>}
            {resumeJson.personalInfo?.phone && <span>{resumeJson.personalInfo.phone}</span>}
            {resumeJson.personalInfo?.location && <span>{resumeJson.personalInfo.location}</span>}
            {resumeJson.personalInfo?.linkedin && <span>{resumeJson.personalInfo.linkedin}</span>}
            {resumeJson.personalInfo?.github && <span>{resumeJson.personalInfo.github}</span>}
          </div>
        </div>

        {resumeJson.summary && (
          <SectionBlock title="Summary">
            <p className="text-sm leading-relaxed text-slate-300">{resumeJson.summary}</p>
          </SectionBlock>
        )}

        {skillEntries(resumeJson.skills).length > 0 && (
          <SectionBlock title="Skills">
            <div className="space-y-2 text-sm">
              {skillEntries(resumeJson.skills).map(([group, values]) => (
                <div key={group}>
                  <span className="font-semibold capitalize text-slate-200">{group}: </span>
                  <span className="text-slate-300">{(values as string[]).join(', ')}</span>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {resumeJson.experience?.length > 0 && (
          <SectionBlock title="Experience">
            <div className="space-y-4">
              {resumeJson.experience.map((item: any, index: number) => (
                <div key={item.id || index}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="font-semibold text-slate-100">
                      {item.title} at {item.company}
                      {item.location && <span className="text-slate-400 font-normal">, {item.location}</span>}
                    </p>
                    <p className="text-xs text-slate-500 shrink-0">
                      {item.startDate} – {item.current ? 'Present' : item.endDate}
                    </p>
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                    {item.bullets?.map((bullet: string, bulletIndex: number) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {resumeJson.projects?.length > 0 && (
          <SectionBlock title="Projects">
            <div className="space-y-4">
              {resumeJson.projects.map((project: any, index: number) => (
                <div key={project.id || index}>
                  <p className="font-semibold text-slate-100">{project.name}</p>
                  {project.technologies?.length > 0 && (
                    <p className="mt-1 text-xs text-indigo-300">{project.technologies.join(', ')}</p>
                  )}
                  {project.description && (
                    <p className="mt-1 text-sm text-slate-400">{project.description}</p>
                  )}
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                    {project.bullets?.map((bullet: string, bulletIndex: number) => (
                      <li key={bulletIndex}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {resumeJson.education?.length > 0 && (
          <SectionBlock title="Education">
            <div className="space-y-2">
              {resumeJson.education.map((item: any, index: number) => (
                <div key={item.id || index} className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-100">{item.institution}</span>
                  <span> — {item.degree}{item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ''}</span>
                  {(item.startDate || item.endDate) && (
                    <span className="text-slate-500">
                      {' '}({[item.startDate, item.endDate].filter(Boolean).join(' – ')})
                    </span>
                  )}
                  {item.gpa && <span className="text-slate-500"> · GPA: {item.gpa}</span>}
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {(resumeJson.achievements?.length > 0 || resumeJson.certifications?.length > 0) && (
          <SectionBlock title="Certifications & Achievements">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              {resumeJson.certifications?.map((item: any, index: number) => (
                <li key={item.id || `cert-${index}`}>
                  <span className="font-medium text-slate-200">{item.name}</span>
                  {item.issuer && <span className="text-slate-400"> — {item.issuer}</span>}
                  {item.date && <span className="text-slate-500"> ({item.date})</span>}
                </li>
              ))}
              {resumeJson.achievements?.map((item: any, index: number) => (
                <li key={`achievement-${index}`}>
                  {typeof item === 'string' ? item : item.title || item.description || item.name}
                </li>
              ))}
            </ul>
          </SectionBlock>
        )}
      </div>
    </div>
  );
}
