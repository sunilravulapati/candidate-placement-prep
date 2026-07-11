'use client';

import { useState, useEffect } from 'react';
import { Layers, FileCheck2, Cpu, Edit3, Trash2 } from 'lucide-react';
import { listResumesAction, deleteResumeAction } from '@backend/features/resume/actions';
import Link from 'next/link';

interface VersionsTabProps {
  resume: any;
}

export default function VersionsTab({ resume }: VersionsTabProps) {
  const [groupResumes, setGroupResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await listResumesAction();
      const filtered = data.filter(r => r.groupId === resume.groupId).sort((a, b) => b.version - a.version);
      setGroupResumes(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (resume?.groupId) loadData();
  }, [resume?.groupId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this version?')) return;
    try {
      await deleteResumeAction(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-slate-500 animate-pulse">Loading versions...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          Version History for {resume.name}
        </h4>
      </div>

      <div className="grid gap-4">
        {groupResumes.map((ver, idx) => {
          const isLatest = idx === 0;
          return (
            <div key={ver.id} className={`bg-slate-900/50 border ${isLatest ? 'border-violet-500/50' : 'border-slate-800'} p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 transition-colors relative overflow-hidden`}>
              {isLatest && <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${isLatest ? 'bg-violet-900/30' : 'bg-slate-800'}`}>
                  <FileCheck2 className={`w-6 h-6 ${isLatest ? 'text-violet-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h5 className="font-bold text-slate-100">{ver.name}</h5>
                    {ver.isGenerated ? (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Generated v{ver.version}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        Original v{ver.version}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    {new Date(ver.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Link 
                  href={`/resume-editor/${ver.id}`}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm"
                >
                  <Edit3 className="w-4 h-4" /> Open Editor
                </Link>
                <button 
                  onClick={(e) => handleDelete(e, ver.id)}
                  disabled={groupResumes.length === 1} // Prevent deleting the last version here
                  className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                  title="Delete Version"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
