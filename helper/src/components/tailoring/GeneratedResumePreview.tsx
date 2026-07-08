'use client';

import React from 'react';
import { ExternalLink, FileJson, Save } from 'lucide-react';

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
  return Object.entries(skills).filter(([, value]) => Array.isArray(value) && value.length > 0);
}

export function GeneratedResumePreview({
  resumeJson,
  version,
  resumeId,
}: {
  resumeJson: any;
  version?: number;
  resumeId?: string | null;
}) {
  if (!resumeJson) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
        <FileJson className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm font-medium text-slate-300">Generated resume preview will appear here</p>
        <p className="mt-1 text-xs text-slate-500">JSON is rendered directly after generation.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/50">
      <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <FileJson className="h-4 w-4 text-emerald-400" />
            Generated Resume JSON
          </div>
          <p className="mt-1 text-xs text-slate-500">{version ? `Saved as version ${version}` : 'Ready to save as a new version'}</p>
        </div>
        {resumeId && (
          <a
            href={`/resume-editor/${resumeId}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/15"
          >
            <Save className="h-3.5 w-3.5" />
            Open Saved Version
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      <div className="max-h-[42rem] space-y-5 overflow-y-auto p-5 custom-scrollbar">
        <div className="border-b border-slate-800/70 pb-4 text-center">
          <h2 className="text-2xl font-bold text-slate-100">{resumeJson.personalInfo?.fullName || 'Generated Resume'}</h2>
          <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-400">
            {resumeJson.personalInfo?.email && <span>{resumeJson.personalInfo.email}</span>}
            {resumeJson.personalInfo?.phone && <span>{resumeJson.personalInfo.phone}</span>}
            {resumeJson.personalInfo?.location && <span>{resumeJson.personalInfo.location}</span>}
            {resumeJson.personalInfo?.linkedin && <span>{resumeJson.personalInfo.linkedin}</span>}
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
                    <p className="font-semibold text-slate-100">{item.title} at {item.company}</p>
                    <p className="text-xs text-slate-500">{item.startDate} - {item.current ? 'Present' : item.endDate}</p>
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                    {item.bullets?.map((bullet: string, bulletIndex: number) => <li key={bulletIndex}>{bullet}</li>)}
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
                  {project.technologies?.length > 0 && <p className="mt-1 text-xs text-indigo-300">{project.technologies.join(', ')}</p>}
                  {project.description && <p className="mt-2 text-sm text-slate-300">{project.description}</p>}
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-300">
                    {project.bullets?.map((bullet: string, bulletIndex: number) => <li key={bulletIndex}>{bullet}</li>)}
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
                  <span> - {item.degree}{item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ''}</span>
                </div>
              ))}
            </div>
          </SectionBlock>
        )}

        {(resumeJson.achievements?.length > 0 || resumeJson.certifications?.length > 0) && (
          <SectionBlock title="Achievements">
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              {resumeJson.achievements?.map((item: any, index: number) => (
                <li key={`achievement-${index}`}>{typeof item === 'string' ? item : item.title || item.description || item.name}</li>
              ))}
              {resumeJson.certifications?.map((item: any, index: number) => (
                <li key={item.id || `certification-${index}`}>{item.name}{item.issuer ? ` - ${item.issuer}` : ''}</li>
              ))}
            </ul>
          </SectionBlock>
        )}
      </div>
    </div>
  );
}
