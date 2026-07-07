import React from 'react';
import { LayoutDashboard, FileText, Code, Briefcase, GraduationCap, GitCompare, Eye } from 'lucide-react';

const TABS = [
  { id: 'personalInfo', label: 'Personal Info', icon: LayoutDashboard },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: FileText },
  { id: 'diff', label: 'Diff View', icon: GitCompare },
  { id: 'preview', label: 'HTML Preview', icon: Eye },
];

export function EditorTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  return (
    <div className="py-4">
      <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Sections
      </div>
      <ul className="space-y-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
