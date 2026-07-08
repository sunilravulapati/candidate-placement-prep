import React, { memo } from 'react';
import { Textarea } from '@/components/ui';

export const SectionEditor = memo(function SectionEditor({
  section,
  data,
  onChange,
}: {
  section: string;
  data: unknown;
  onChange: (d: unknown) => void;
}) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-sm text-slate-500">No data available for</p>
        <p className="mt-1 text-lg font-semibold capitalize text-slate-300">{section}</p>
      </div>
    );
  }

  if (typeof data === 'string') {
    return (
      <div className="p-6 md:p-8">
        <h2 className="mb-1 text-xl font-bold capitalize text-slate-100">{section}</h2>
        <p className="mb-4 text-xs text-slate-500">Edit the content below. Changes autosave after 2 seconds.</p>
        <Textarea
          value={data}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[280px] font-serif text-base leading-relaxed"
          aria-label={`${section} content`}
        />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <h2 className="mb-1 text-xl font-bold capitalize text-slate-100">{section}</h2>
      <p className="mb-4 text-xs text-slate-500">Structured JSON editor for complex sections.</p>
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
        <Textarea
          value={JSON.stringify(data, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch {
              // ignore parse errors until valid
            }
          }}
          className="min-h-[500px] font-mono text-sm leading-relaxed"
          aria-label={`${section} JSON editor`}
        />
      </div>
    </div>
  );
});
