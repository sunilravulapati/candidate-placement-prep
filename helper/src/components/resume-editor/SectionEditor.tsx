'use client';

import React, { memo, useState } from 'react';
import {
  PersonalInfoForm,
  SummaryForm,
  ExperienceForm,
  ProjectsForm,
  EducationForm,
  SkillsForm,
  CertificationsForm,
} from './forms';
import { Code, FormInput, AlertCircle } from 'lucide-react';

interface SectionEditorProps {
  section: string;
  data: any;
  onChange: (d: any) => void;
}

export const SectionEditor = memo(function SectionEditor({
  section,
  data,
  onChange,
}: SectionEditorProps) {
  const [isRawJsonMode, setIsRawJsonMode] = useState(false);
  const [rawJsonError, setRawJsonError] = useState<string | null>(null);

  const renderStructuredForm = () => {
    switch (section) {
      case 'personalInfo':
      case 'contact':
        return <PersonalInfoForm data={data || {}} onChange={onChange} />;
      case 'summary':
        return <SummaryForm data={typeof data === 'string' ? data : ''} onChange={onChange} />;
      case 'experience':
        return <ExperienceForm data={Array.isArray(data) ? data : []} onChange={onChange} />;
      case 'projects':
        return <ProjectsForm data={Array.isArray(data) ? data : []} onChange={onChange} />;
      case 'education':
        return <EducationForm data={Array.isArray(data) ? data : []} onChange={onChange} />;
      case 'skills':
        return <SkillsForm data={typeof data === 'object' && data !== null ? data : {}} onChange={onChange} />;
      case 'certifications':
        return <CertificationsForm data={Array.isArray(data) ? data : []} onChange={onChange} />;
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-100 capitalize">{section}</h3>
            <p className="text-xs text-slate-400">
              Editing structured data for {section}.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-5 sm:p-7 space-y-6">
      {/* Mode Toggle Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Section: <span className="text-violet-400 font-bold capitalize">{section}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setIsRawJsonMode(!isRawJsonMode);
            setRawJsonError(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
        >
          {isRawJsonMode ? (
            <>
              <FormInput className="w-3.5 h-3.5 text-violet-400" />
              <span>Switch to Form Editor</span>
            </>
          ) : (
            <>
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>Raw JSON Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {isRawJsonMode ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Directly edit the underlying JSON for this section. Invalid JSON will be ignored until fixed.
            </p>
          </div>
          {rawJsonError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rawJsonError}</span>
            </div>
          )}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
            <textarea
              defaultValue={JSON.stringify(data, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setRawJsonError(null);
                  onChange(parsed);
                } catch (err: any) {
                  setRawJsonError(`Invalid JSON: ${err.message}`);
                }
              }}
              rows={16}
              className="w-full bg-transparent font-mono text-xs leading-relaxed text-slate-200 focus:outline-none resize-y"
            />
          </div>
        </div>
      ) : (
        renderStructuredForm()
      )}
    </div>
  );
});
