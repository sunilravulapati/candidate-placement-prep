import React, { memo } from 'react';
import {
  User,
  FileText,
  Code,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  GitCompare,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export const EDITOR_SECTIONS = [
  { id: 'personalInfo', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'diff', label: 'Version Diff', icon: GitCompare },
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
      <div className="flex gap-1 p-2 overflow-x-auto no-scrollbar" role="tablist">
        {EDITOR_SECTIONS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all',
                active
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <nav className="py-4" aria-label="Resume sections">
      <div className="mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Resume Sections
      </div>
      <ul className="space-y-1 px-2" role="tablist">
        {EDITOR_SECTIONS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <li key={tab.id}>
              <button
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
                  active
                    ? 'bg-violet-600/15 text-violet-300 font-bold border border-violet-500/20 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
                )}
              >
                <Icon className={cn('h-4 w-4', active ? 'text-violet-400' : 'text-slate-500')} />
                <span>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});
