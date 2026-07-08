import React, { memo, useMemo } from 'react';

function flattenResume(value: unknown, prefix = 'resume'): Record<string, string> {
  if (value === null || value === undefined) return {};
  if (typeof value !== 'object') return { [prefix]: String(value) };

  if (Array.isArray(value)) {
    return value.reduce<Record<string, string>>(
      (acc, item, index) => ({
        ...acc,
        ...flattenResume(item, `${prefix}.${index + 1}`),
      }),
      {}
    );
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, child]) => ({
      ...acc,
      ...flattenResume(child, `${prefix}.${key}`),
    }),
    {}
  );
}

export const DiffEngine = memo(function DiffEngine({
  originalJson,
  currentJson,
}: {
  originalJson: Record<string, unknown>;
  currentJson: Record<string, unknown>;
}) {
  const changes = useMemo(() => {
    const original = flattenResume(originalJson);
    const current = flattenResume(currentJson);
    const keys = Array.from(new Set([...Object.keys(original), ...Object.keys(current)])).sort();
    return keys
      .map((key) => ({ key, before: original[key], after: current[key] }))
      .filter((entry) => entry.before !== entry.after);
  }, [originalJson, currentJson]);

  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      <h2 className="mb-1 text-xl font-bold text-slate-100">Version Changes</h2>
      <p className="mb-6 text-sm text-slate-400">
        Section-level comparison between the original canonical JSON and your current edits.
      </p>

      {changes.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-sm text-slate-500">
          No differences found between these versions.
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pr-2">
          {changes.map((change) => (
            <div key={change.key} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30">
              <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-2 font-mono text-xs font-semibold text-slate-400">
                {change.key.replace(/^resume\./, '')}
              </div>
              <div className="grid grid-cols-1 divide-y divide-slate-800 md:grid-cols-2 md:divide-x md:divide-y-0">
                <div className="bg-rose-500/5 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-400">Original</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                    {change.before || 'Removed'}
                  </p>
                </div>
                <div className="bg-emerald-500/5 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-400">Current</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                    {change.after || 'Added'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
