import React, { memo } from 'react';
import { LayoutDashboard, FileText, Code, Briefcase, GraduationCap, GitCompare, Eye } from 'lucide-react';
import { cn } from '@/lib/cn';

const TABS = [
  { id: 'personalInfo', label: 'Personal Info', icon: LayoutDashboard },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: FileText },
  { id: 'diff', label: 'Diff View', icon: GitCompare },
  { id: 'preview', label: 'Preview', icon: Eye },
];

export const EditorTabs = memo(function EditorTabs({
  activeTab,
  setActiveTab,
  compact = false,
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex gap-1 p-2" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2 text-[10px] font-medium transition-colors',
                active ? 'bg-violet-600/15 text-violet-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label.split(' ')[0]}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="py-4" aria-label="Resume sections">
      <div className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Sections
      </div>
      <ul className="space-y-0.5" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <li key={tab.id}>
              <button
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-inset',
                  active
                    ? 'border-r-2 border-violet-500 bg-violet-600/10 text-violet-400'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                )}
              >
                <Icon className={cn('h-4 w-4', active ? 'text-violet-400' : 'text-slate-500')} />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
