import React, { memo, useMemo } from 'react';
import { PlusCircle, MinusCircle, RefreshCw } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ChangeType = 'added' | 'removed' | 'modified';

interface DiffEntry {
  key: string;
  section: string;
  label: string;
  before?: string;
  after?: string;
  type: ChangeType;
}

// ---------------------------------------------------------------------------
// Section detection helpers
// ---------------------------------------------------------------------------

/** Maps a flattened key path to a human-readable section name. */
function getSectionName(key: string): string {
  const segments = key.replace(/^resume\./, '').split('.');
  const root = segments[0] ?? '';
  const sectionMap: Record<string, string> = {
    personalInfo: 'Personal Info',
    summary: 'Summary',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    skills: 'Skills',
    certifications: 'Certifications',
    achievements: 'Achievements',
  };
  return sectionMap[root] ?? root;
}

/** Converts a dotted key path into a human-readable label. */
function makeLabel(key: string): string {
  return key
    .replace(/^resume\./, '')
    .replace(/\.\d+\./g, ' › ')
    .replace(/\.\d+$/, '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\./g, ' › ')
    .trim();
}

// ---------------------------------------------------------------------------
// Flatten helper (unchanged from original, preserved for correctness)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Change type badge
// ---------------------------------------------------------------------------

function ChangeBadge({ type }: { type: ChangeType }) {
  if (type === 'added') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
        <PlusCircle className="w-3 h-3" /> Added
      </span>
    );
  }
  if (type === 'removed') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
        <MinusCircle className="w-3 h-3" /> Removed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
      <RefreshCw className="w-3 h-3" /> Modified
    </span>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionGroupHeader({
  section,
  entries,
}: {
  section: string;
  entries: DiffEntry[];
}) {
  const added = entries.filter(e => e.type === 'added').length;
  const removed = entries.filter(e => e.type === 'removed').length;
  const modified = entries.filter(e => e.type === 'modified').length;

  return (
    <div className="flex items-center justify-between mb-3 mt-6 first:mt-0">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{section}</h3>
      <div className="flex items-center gap-3 text-[10px] font-semibold">
        {added > 0 && <span className="text-emerald-400">{added} added</span>}
        {modified > 0 && <span className="text-amber-400">{modified} modified</span>}
        {removed > 0 && <span className="text-rose-400">{removed} removed</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main DiffEngine component
// ---------------------------------------------------------------------------

export const DiffEngine = memo(function DiffEngine({
  originalJson,
  currentJson,
}: {
  originalJson: Record<string, unknown>;
  currentJson: Record<string, unknown>;
}) {
  const { grouped, totalAdded, totalModified, totalRemoved } = useMemo(() => {
    const original = flattenResume(originalJson);
    const current = flattenResume(currentJson);
    const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(current)])).sort();

    const entries: DiffEntry[] = allKeys
      .filter(key => original[key] !== current[key])
      .map(key => {
        const before = original[key];
        const after = current[key];
        const type: ChangeType = before === undefined ? 'added' : after === undefined ? 'removed' : 'modified';
        return {
          key,
          section: getSectionName(key),
          label: makeLabel(key),
          before,
          after,
          type,
        };
      });

    // Group by section
    const groups: Record<string, DiffEntry[]> = {};
    for (const entry of entries) {
      if (!groups[entry.section]) groups[entry.section] = [];
      groups[entry.section].push(entry);
    }

    return {
      grouped: groups,
      totalAdded: entries.filter(e => e.type === 'added').length,
      totalModified: entries.filter(e => e.type === 'modified').length,
      totalRemoved: entries.filter(e => e.type === 'removed').length,
    };
  }, [originalJson, currentJson]);

  const hasChanges = totalAdded + totalModified + totalRemoved > 0;

  return (
    <div className="flex h-full flex-col p-6 md:p-8">
      <h2 className="mb-1 text-xl font-bold text-slate-100">Version Changes</h2>
      <p className="text-sm text-slate-400 mb-2">
        Section-level comparison between the original and current edits.
      </p>

      {/* Summary bar */}
      {hasChanges && (
        <div className="flex items-center gap-4 mb-6 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs font-semibold">
          {totalAdded > 0 && (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <PlusCircle className="w-3.5 h-3.5" /> {totalAdded} added
            </span>
          )}
          {totalModified > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <RefreshCw className="w-3.5 h-3.5" /> {totalModified} modified
            </span>
          )}
          {totalRemoved > 0 && (
            <span className="flex items-center gap-1.5 text-rose-400">
              <MinusCircle className="w-3.5 h-3.5" /> {totalRemoved} removed
            </span>
          )}
        </div>
      )}

      {!hasChanges ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-sm text-slate-500">
          No differences found between these versions.
        </div>
      ) : (
        <div className="overflow-y-auto pr-2 space-y-1">
          {Object.entries(grouped).map(([section, entries]) => (
            <div key={section}>
              <SectionGroupHeader section={section} entries={entries} />
              <div className="space-y-3">
                {entries.map(change => (
                  <div
                    key={change.key}
                    className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/30"
                  >
                    {/* Key path header */}
                    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2">
                      <span className="font-mono text-xs font-semibold text-slate-400 truncate">
                        {change.label}
                      </span>
                      <ChangeBadge type={change.type} />
                    </div>

                    <div className="grid grid-cols-1 divide-y divide-slate-800 md:grid-cols-2 md:divide-x md:divide-y-0">
                      {/* Before */}
                      {change.type !== 'added' && (
                        <div className="bg-rose-500/5 p-4">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-400">Before</p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                            {change.before ?? '—'}
                          </p>
                        </div>
                      )}
                      {/* After */}
                      {change.type !== 'removed' && (
                        <div className={`p-4 ${change.type === 'added' ? 'bg-emerald-500/5 md:col-span-2' : 'bg-emerald-500/5'}`}>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-400">After</p>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                            {change.after ?? '—'}
                          </p>
                        </div>
                      )}
                      {/* Removed — show only before */}
                      {change.type === 'removed' && (
                        <div className="bg-slate-950/30 p-4 flex items-center justify-center md:col-span-1">
                          <p className="text-xs text-slate-600 italic">Field removed</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
