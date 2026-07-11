'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Edit3, Layers, FileCheck2, ShieldAlert, Cpu, CheckCircle } from 'lucide-react';
import { listResumesAction, uploadAndCheckCacheAction, deleteResumeAction } from '@backend/features/resume/actions';

interface LibraryTabProps {
  onSelectResume: (resume: any) => void;
  activeResumeId?: string;
}

export default function LibraryTab({ onSelectResume, activeResumeId }: LibraryTabProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await listResumesAction();
      setResumes(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('Please upload PDF files only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10MB.');
      return;
    }
    setIsUploading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      await uploadAndCheckCacheAction(formData);
      await loadData();
    } catch (err) {
      setErrorMsg((err as Error).message || 'Processing failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      await deleteResumeAction(id);
      await loadData();
    } catch (err) {
      setErrorMsg('Failed to delete resume');
    }
  };

  const toggleGroup = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Group resumes by groupId
  const groups = resumes.reduce((acc, curr) => {
    if (!acc[curr.groupId]) acc[curr.groupId] = [];
    acc[curr.groupId].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div 
        onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
        onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
          dragActive ? 'border-violet-400 bg-violet-900/20 shadow-[0_0_30px_rgba(139,92,246,0.2)] scale-[1.01]' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf" 
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} 
        />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-violet-400' : 'text-slate-500'}`} />
        <h3 className="text-xl font-bold text-white">Upload New Resume</h3>
        <p className="text-slate-400 mt-2 text-sm">Drag and drop your PDF here or click to browse (Max 10MB)</p>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg"
        >
          {isUploading ? 'Uploading...' : 'Browse Files'}
        </button>
        {errorMsg && <p className="text-red-400 text-sm mt-4">{errorMsg}</p>}
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center text-slate-500 py-10">Loading resumes...</div>
        ) : Object.keys(groups).length === 0 ? (
          <div className="text-center text-slate-500 py-10">No resumes found. Upload one to get started.</div>
        ) : (
          Object.entries(groups).map(([groupId, groupResumes]) => {
            const sortedResumes = (groupResumes as any[]).sort((a: any, b: any) => b.version - a.version);
            const latest = sortedResumes[0];
            const isExpanded = expandedGroups[groupId];
            const hasMultiple = sortedResumes.length > 1;

            return (
              <div key={groupId} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl transition-all">
                {/* Latest Resume (Group Header) */}
                <div 
                  onClick={() => onSelectResume(latest)}
                  className={`p-5 cursor-pointer hover:bg-slate-800/60 flex items-center justify-between transition-colors ${activeResumeId === latest.id ? 'border-l-4 border-l-violet-500 bg-violet-950/20' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl">
                      <FileCheck2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-100">{latest.name}</h4>
                        {latest.isGenerated ? (
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Generated v{latest.version}
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                            Original
                          </span>
                        )}
                        {latest.latestAnalysis && (
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> ATS: {latest.latestAnalysis.atsScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Last modified: {new Date(latest.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {hasMultiple && (
                      <button 
                        onClick={(e) => toggleGroup(e, groupId)}
                        className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-lg"
                      >
                        {isExpanded ? 'Hide History' : `+${sortedResumes.length - 1} Versions`}
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDelete(e, latest.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Older Versions */}
                {isExpanded && hasMultiple && (
                  <div className="bg-slate-900/40 p-4 pt-1 space-y-1">
                    {sortedResumes.slice(1).map((ver: any) => (
                      <div 
                        key={ver.id}
                        onClick={() => onSelectResume(ver)}
                        className={`p-3 pl-12 rounded-xl cursor-pointer hover:bg-slate-800/40 flex items-center justify-between transition-colors ${activeResumeId === ver.id ? 'bg-violet-900/10 text-violet-300' : 'text-slate-400'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Layers className="w-4 h-4 text-slate-600" />
                          <span className="font-medium text-sm">v{ver.version}</span>
                          <span className="text-xs text-slate-500">{new Date(ver.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={(e) => handleDelete(e, ver.id)}
                          className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
