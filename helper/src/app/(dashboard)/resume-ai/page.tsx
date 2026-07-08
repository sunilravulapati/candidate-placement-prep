// helper/src/app/resume-ai/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  listResumesAction, 
  renameResumeGroupAction, 
  deleteResumeAction,
  uploadAndCheckCacheAction,
  analyzeResumeAction,
  getResumeAnalysisHistoryAction,
} from '@backend/features/resume/actions';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Edit3, 
  Download, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Gauge,
  History,
  TrendingUp,
  Brain,
  Layers,
  Settings,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Hourglass,
  Cpu
} from 'lucide-react';

type ProgressStep = 'uploading' | 'extracting' | 'analyzing' | 'normalizing' | 'scoring' | 'saving' | 'done';

const STEP_LABELS: Record<ProgressStep, string> = {
  uploading: 'Uploading document to storage...',
  extracting: 'Extracting text and contents...',
  analyzing: 'Analyzing with LLM Recruiter models...',
  normalizing: 'Normalizing schema structures...',
  scoring: 'Running programmatic ATS scorer...',
  saving: 'Saving analysis to database history...',
  done: 'Analysis completed successfully!',
};

export default function ResumeAIPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'history' | 'metadata'>('upload');
  
  // Cache Hit state
  const [cacheHitData, setCacheHitData] = useState<{
    resumeId: string;
    fileName: string;
    latestAnalysis?: any;
  } | null>(null);

  // Analysis result states
  const [selectedResume, setSelectedResume] = useState<any | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<any | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  // Orchestrator progress states
  const [currentStep, setCurrentStep] = useState<ProgressStep | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({ text: '', type: null });
  const [dragActive, setDragActive] = useState(false);
  
  // Modal states
  const [renameTarget, setRenameTarget] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load resumes listing
  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await listResumesAction();
      setResumes(data);
      return data;
    } catch {
      setMessage({ text: 'Failed to load resumes from the server.', type: 'error' });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatBytes = (bytes: number = 245000) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUploadAndAnalyze(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUploadAndAnalyze(e.target.files[0]);
    }
  };

  // Upload and analyze flow (coordinates progress steps & cache checking)
  const handleUploadAndAnalyze = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setMessage({ text: 'Please upload PDF files only.', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ text: 'File size must be under 10MB.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    setCurrentStep('uploading');
    setMessage({ text: '', type: null });

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload and backend file-hashing (Rule 5)
      const res = await uploadAndCheckCacheAction(formData);
      
      if (res.cacheHit) {
        // Cache hit found. Pause and let the user select
        setCacheHitData({
          resumeId: res.resumeId!,
          fileName: res.fileName!,
          latestAnalysis: res.latestAnalysis,
        });
        setIsProcessing(false);
        setCurrentStep(null);
      } else {
        // Cache miss: proceed directly to analyze
        await triggerAnalysis(res.resumeId!, false);
      }
    } catch (err) {
      setMessage({ text: (err as Error).message || 'Processing failed.', type: 'error' });
      setIsProcessing(false);
      setCurrentStep(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Triggers the analysis orchestration (with steps)
  const triggerAnalysis = async (resumeId: string, forceReanalyze: boolean) => {
    setIsProcessing(true);
    setCacheHitData(null);
    setMessage({ text: '', type: null });
    
    // Simulate steps progress sequentially
    const runStep = async (step: ProgressStep, delay = 700) => {
      setCurrentStep(step);
      await new Promise(resolve => setTimeout(resolve, delay));
    };

    try {
      await runStep('extracting');
      await runStep('analyzing', 2000); // AI stage takes longer
      await runStep('normalizing');
      await runStep('scoring');
      await runStep('saving');

      const response = await analyzeResumeAction(resumeId, forceReanalyze);

      if (response.success) {
        setCurrentStep('done');
        setMessage({ 
          text: response.reused 
            ? `Retrieved cached analysis for this resume.` 
            : `Analysis completed successfully in ${response.processingTime}ms!`, 
          type: 'success' 
        });
        
        // Refresh documents list
        const refreshedResumes = await loadData();

        // Load details for displaying in tabs
        const activeRes = refreshedResumes.find(r => r.id === resumeId) || { id: resumeId, name: 'Active Document' };
        setSelectedResume(activeRes);

        const history = await getResumeAnalysisHistoryAction(resumeId);
        setAnalysisHistory(history);
        setLatestAnalysis({
          overallScore: response.overallScore,
          atsScore: response.atsScore,
          semanticScore: response.semanticScore,
          warnings: response.warnings,
          preservationScore: response.preservationScore,
          modelUsed: response.modelUsed,
          processingTime: response.processingTime,
          createdAt: response.createdAt || new Date(),
          promptVersion: response.promptVersion,
          analysis: response.analysis || {},
        });

        // Toggle to Analysis tab
        setActiveTab('analysis');
      }
    } catch (err) {
      setMessage({ text: (err as Error).message || 'Analysis run failed.', type: 'error' });
    } finally {
      setIsProcessing(false);
      setCurrentStep(null);
    }
  };

  // Select resume from list to show analysis details
  const viewResumeDetails = async (resume: any) => {
    setSelectedResume(resume);
    setMessage({ text: '', type: null });
    
    if (resume.latestAnalysis) {
      const latest = resume.latestAnalysis;
      setLatestAnalysis(latest);
      setAnalysisHistory(await getResumeAnalysisHistoryAction(resume.id));
      setActiveTab('analysis');
    } else {
      // Prompt user to analyze
      setLatestAnalysis(null);
      setAnalysisHistory([]);
      setActiveTab('upload');
      setMessage({ text: `Resume "${resume.name}" has not been analyzed yet. Click Analyze below to start.`, type: 'info' as any });
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setIsRenaming(true);
    setMessage({ text: '', type: null });
    try {
      const response = await renameResumeGroupAction(renameTarget.groupId, renameValue.trim());
      if (response.success) {
        setMessage({ text: 'Resume renamed successfully.', type: 'success' });
        setRenameTarget(null);
        await loadData();
      }
    } catch (err) {
      setMessage({ text: (err as Error).message || 'Failed to rename resume.', type: 'error' });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setMessage({ text: '', type: null });
    try {
      const response = await deleteResumeAction(deleteTarget.id);
      if (response.success) {
        setMessage({ text: 'Resume deleted successfully.', type: 'success' });
        if (selectedResume?.id === deleteTarget.id) {
          setSelectedResume(null);
          setLatestAnalysis(null);
          setAnalysisHistory([]);
        }
        setDeleteTarget(null);
        await loadData();
      }
    } catch (err) {
      setMessage({ text: (err as Error).message || 'Failed to delete resume.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-slate-900/30 border border-indigo-500/20 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Brain className="w-8 h-8 text-violet-400 animate-pulse" />
              Resume Intelligence Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
              Upload your PDF resume to run deep semantic scans, score ATS programmatic compliance, and index your profile metrics inside the dynamic analytics framework.
            </p>
          </div>
          <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span>AI Orchestrated Pipeline</span>
          </div>
        </div>
      </div>

      {/* Progressive Processing Overlay */}
      {isProcessing && currentStep && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
          <div className="glass-card max-w-md w-full p-8 rounded-3xl border border-indigo-500/30 text-center space-y-6 shadow-2xl bg-slate-950/80">
            <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Processing Pipeline</h3>
              <p className="text-xs text-slate-400">{STEP_LABELS[currentStep]}</p>
            </div>
            
            {/* Horizontal progress bar indicators */}
            <div className="flex gap-1.5 justify-center">
              {(['uploading', 'extracting', 'analyzing', 'normalizing', 'scoring', 'saving'] as ProgressStep[]).map((step, idx) => {
                const steps = ['uploading', 'extracting', 'analyzing', 'normalizing', 'scoring', 'saving'];
                const currIdx = steps.indexOf(currentStep);
                const isPassed = steps.indexOf(step) < currIdx;
                const isActive = step === currentStep;

                return (
                  <div 
                    key={step} 
                    className={`h-1.5 w-10 rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'bg-violet-400 w-14 animate-pulse' 
                        : isPassed 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-800'
                    }`} 
                    title={step}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Alert / Message Banner */}
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border text-sm transition-all ${
          message.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
            : message.type === 'error'
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-indigo-400" />
          )}
          <span className="font-medium">{message.text}</span>
          <button 
            onClick={() => setMessage({ text: '', type: null })} 
            className="ml-auto hover:text-white text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Navigation (Tabs) */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Stored Resumes List (Always visible as sidebar) */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              Documents ({resumes.length})
            </h3>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="p-8 text-center glass-card rounded-2xl">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Loading documents...</p>
              </div>
            ) : resumes.length > 0 ? (
              resumes.map((resume) => {
                const isSelected = selectedResume?.id === resume.id;
                const hasAnalysis = Boolean(resume.latestAnalysis);
                const score = hasAnalysis ? resume.latestAnalysis.overallScore : null;

                return (
                  <div 
                    key={resume.id}
                    onClick={() => viewResumeDetails(resume)}
                    className={`glass-card p-4 rounded-2xl border cursor-pointer transition-all flex justify-between items-center group ${
                      isSelected 
                        ? 'border-indigo-500/50 bg-indigo-950/10 shadow-lg shadow-indigo-950/35' 
                        : 'border-slate-900/60 hover:border-slate-800 hover:bg-slate-950/20'
                    }`}
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors" title={resume.name}>
                        {resume.name}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {score !== null ? (
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-extrabold text-violet-400 bg-violet-950/40 border border-violet-500/20 px-2 py-0.5 rounded-lg">
                            {score}
                          </span>
                          <span className="text-[8px] text-slate-500 mt-0.5">Overall</span>
                        </div>
                      ) : (
                        <span className="text-[8px] text-slate-600 font-bold bg-slate-950 border border-slate-900 px-2 py-0.5 rounded-lg">
                          UNSCANNED
                        </span>
                      )}
                      
                      {/* Hover action menu */}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameTarget(resume);
                            setRenameValue(resume.name.replace('.pdf', ''));
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-1 rounded-md border border-slate-800"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(resume);
                          }}
                          className="bg-slate-900 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 p-1 rounded-md border border-slate-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 glass-card rounded-2xl border border-slate-900">
                <p className="text-xs text-slate-500">No resumes uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tabbed Details Dashboard (Rules 8, 9, 10) */}
        <div className="flex-grow space-y-6">
          
          {/* Tabs bar */}
          <div className="flex border-b border-slate-900 gap-1.5 overflow-x-auto pb-px">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 uppercase tracking-wider ${
                activeTab === 'upload' 
                  ? 'border-violet-500 text-violet-400 bg-violet-600/5 rounded-t-xl' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload & Scan
            </button>
            <button 
              onClick={() => setActiveTab('analysis')}
              disabled={!latestAnalysis}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none ${
                activeTab === 'analysis' 
                  ? 'border-violet-500 text-violet-400 bg-violet-600/5 rounded-t-xl' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              Analysis Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              disabled={!latestAnalysis}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none ${
                activeTab === 'history' 
                  ? 'border-violet-500 text-violet-400 bg-violet-600/5 rounded-t-xl' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Analyses History
            </button>
            <button 
              onClick={() => setActiveTab('metadata')}
              disabled={!latestAnalysis}
              className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 uppercase tracking-wider disabled:opacity-30 disabled:pointer-events-none ${
                activeTab === 'metadata' 
                  ? 'border-violet-500 text-violet-400 bg-violet-600/5 rounded-t-xl' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Metadata & Runs
            </button>
          </div>

          {/* Tab Workspaces */}
          <div className="space-y-6">
            
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-3xl space-y-4">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-violet-400" />
                    Drag & Drop Resume
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload your PDF document to run structural limits matching, keyword extraction, and recursive repair scans.
                  </p>

                  <form 
                    onDragEnter={handleDrag} 
                    onDragOver={handleDrag} 
                    onDragLeave={handleDrag} 
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-violet-500 bg-violet-600/5' 
                        : 'border-slate-800 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-950/50'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept=".pdf" 
                      onChange={handleFileInput}
                      disabled={isProcessing}
                    />
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-full text-slate-400 group-hover:text-white transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-200">Click or drag PDF here</p>
                      <p className="text-[10px] text-slate-500 mt-1">Maximum file size: 10MB</p>
                    </div>
                  </form>
                </div>

                {selectedResume && !latestAnalysis && (
                  <div className="glass-card p-6 rounded-3xl flex justify-between items-center border border-indigo-500/20 bg-indigo-950/10">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-200">Selected: {selectedResume.name}</h4>
                      <p className="text-xs text-slate-400">This document has not been scanned. Run AI Analysis to generate score.</p>
                    </div>
                    <button 
                      onClick={() => triggerAnalysis(selectedResume.id, false)}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
                    >
                      <Brain className="w-4 h-4" />
                      Run Scanner
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Dashboard Tab (Rule 8) */}
            {activeTab === 'analysis' && latestAnalysis && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Radial scores display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Overall score wheel */}
                  <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
                    <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall ATS Score</span>
                    
                    <div className="relative flex items-center justify-center">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="56" 
                          cy="56" 
                          r="48" 
                          stroke="url(#grad)" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - latestAnalysis.overallScore / 100)}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute text-2xl font-black text-white">{latestAnalysis.overallScore}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-semibold">
                      Out of 100 Ceiling
                    </span>
                  </div>

                  {/* Programmatic sub-score */}
                  <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Programmatic Check</span>
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke="#818cf8" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (latestAnalysis.atsScore * 2) / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xl font-extrabold text-white">{latestAnalysis.atsScore}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      Structure & Keywords (Max 50)
                    </span>
                  </div>

                  {/* Semantic sub-score */}
                  <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Semantic Evaluation</span>
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="48" 
                          cy="48" 
                          r="40" 
                          stroke="#c084fc" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - (latestAnalysis.semanticScore * 2) / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xl font-extrabold text-white">{latestAnalysis.semanticScore}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      LLM Recruiter (Max 50)
                    </span>
                  </div>

                </div>

                {/* Brutally honest summary */}
                <div className="glass-card p-6 rounded-3xl border border-violet-500/10 bg-gradient-to-br from-violet-950/10 to-slate-950 space-y-2">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Brutally Honest AI Recruiter Summary
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed italic">
                    &quot;{latestAnalysis.analysis?.summary || 'No summary generated.'}&quot;
                  </p>
                </div>

                {/* Warnings Section (Amber) */}
                {latestAnalysis.warnings && latestAnalysis.warnings.length > 0 && (
                  <div className="bg-amber-950/10 border border-amber-500/20 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      Quality Warning Alerts ({latestAnalysis.warnings.length})
                    </h4>
                    <ul className="space-y-1.5 text-xs text-amber-300/90 list-disc list-inside">
                      {latestAnalysis.warnings.map((w: string, idx: number) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strengths & Weaknesses / Improvements grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths (Green) */}
                  <div className="glass-card p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-3">
                      <CheckCircle className="w-4 h-4" />
                      Core Strengths Detected
                    </h4>
                    <ul className="space-y-3 text-xs text-slate-300">
                      {latestAnalysis.analysis?.strengths?.map((s: string, idx: number) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <ChevronRight className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      )) || <p className="text-slate-500 italic">No strengths logged.</p>}
                    </ul>
                  </div>

                  {/* Improvements / Suggestions (Amber) */}
                  <div className="glass-card p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-3">
                      <TrendingUp className="w-4 h-4" />
                      Actionable Improvement Gaps
                    </h4>
                    <ul className="space-y-3 text-xs text-slate-300">
                      {latestAnalysis.analysis?.improvements?.map((s: string, idx: number) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <ChevronRight className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      )) || <p className="text-slate-500 italic">No suggestions logged.</p>}
                    </ul>
                  </div>

                </div>

                {/* preservation and detail scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Content Preservation</span>
                    <span className="text-xl font-extrabold text-white mt-1">{latestAnalysis.preservationScore}%</span>
                    <span className="text-[9px] text-slate-400 mt-1">Ratio of details saved during structural trimmings</span>
                  </div>
                  <div className="glass-card p-5 rounded-2xl flex flex-col col-span-1 md:col-span-3 lg:col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-3">10-Point Deep Breakdown</span>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1">
                      {latestAnalysis.analysis?.scores?.breakdown ? Object.entries(latestAnalysis.analysis.scores.breakdown).map(([category, score]: [string, any]) => (
                        <div key={category} className="space-y-1.5">
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                            <span>{category}</span>
                            <span className="text-slate-200 font-bold">{score}/10</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{ width: `${(score / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-500 col-span-2 italic">Detailed breakdown unavailable for legacy analyses.</p>
                      )}
                    </div>
                  </div>
                  <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Scanned Date</span>
                    <span className="text-xs text-slate-200 font-semibold mt-1">
                      {new Date(latestAnalysis.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1">Time elapsed: {latestAnalysis.processingTime}ms</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                  <button 
                    onClick={() => triggerAnalysis(selectedResume.id, true)}
                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    Bypass Cache & Re-analyze
                  </button>
                </div>
              </div>
            )}

            {/* Analyses History Tab (Rule 8) */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-4 h-4 text-violet-400" />
                    Previous Analyses History
                  </h4>
                </div>

                {analysisHistory && analysisHistory.length > 0 ? (
                  <div className="space-y-3">
                    {analysisHistory.map((run, idx) => (
                      <div 
                        key={run.id} 
                        onClick={() => {
                          setLatestAnalysis(run);
                          setActiveTab('analysis');
                        }}
                        className="glass-card p-4 rounded-xl border border-slate-900/60 hover:border-slate-800 hover:bg-slate-950/20 cursor-pointer transition-all flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {new Date(run.createdAt).toLocaleString()}
                          </span>
                          <h4 className="text-xs font-bold text-slate-300">
                            Model Used: {run.modelUsed}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold text-violet-400 bg-violet-950/40 border border-violet-500/20 px-2 py-0.5 rounded-lg">
                              {run.overallScore}
                            </span>
                            <p className="text-[8px] text-slate-500 mt-0.5">Overall</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 glass-card rounded-2xl">
                    <p className="text-xs text-slate-500">No previous analyses runs found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Metadata and Runs Tab (Rule 9) */}
            {activeTab === 'metadata' && latestAnalysis && (
              <div className="space-y-6 animate-fade-in">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* General settings log */}
                  <div className="glass-card p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-3">
                      <Settings className="w-4 h-4 text-violet-400" />
                      Pipeline Run Settings
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-900/50">
                        <span className="text-slate-500">Active LLM Model:</span>
                        <span className="font-mono text-slate-200">{latestAnalysis.modelUsed}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900/50">
                        <span className="text-slate-500">Prompt version:</span>
                        <span className="font-mono text-slate-200">{latestAnalysis.promptVersion}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900/50">
                        <span className="text-slate-500">Processing latency:</span>
                        <span className="font-mono text-slate-200">{latestAnalysis.processingTime}ms</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Overall ATS rating ceiling:</span>
                        <span className="font-bold text-slate-200">100 Max</span>
                      </div>
                    </div>
                  </div>

                  {/* preservation metrics detail */}
                  <div className="glass-card p-6 rounded-3xl space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-3">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      Score Normalizer Parameters
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-900/50">
                        <span className="text-slate-500">Preservation Score:</span>
                        <span className="font-bold text-emerald-400">{latestAnalysis.preservationScore}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900/50">
                        <span className="text-slate-500">Programmatic Sub-Score:</span>
                        <span className="font-mono text-slate-200">{latestAnalysis.atsScore}/50</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-900/50">
                        <span className="text-slate-500">Semantic Sub-Score:</span>
                        <span className="font-mono text-slate-200">{latestAnalysis.semanticScore}/50</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Warnings generated:</span>
                        <span className="font-mono text-slate-200">{latestAnalysis.warnings?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Additional analytics instructions placeholder */}
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl text-xs text-slate-500 leading-relaxed">
                  <p className="font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Hourglass className="w-3.5 h-3.5 text-violet-400" />
                    Analytical Run Tracking Ready
                  </p>
                  Every execution run (both cache hit queries and failed AI timeouts) generates an `AnalysisRun` record. This prepares historical audit metadata for display in the admin telemetry dashboard to track tokens and cost metrics.
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Cache Hit Modal (Rule 5 Cache Reuse dialog) */}
      {cacheHitData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-2.5 rounded-full text-indigo-400">
                <FileCheck2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Duplicate Document Found</h3>
                <p className="text-xs text-slate-500 mt-0.5">SHA-256 match detected on backend.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-900/50">
              The uploaded file matches an existing resume database record <strong className="text-slate-100">&quot;{cacheHitData.fileName}&quot;</strong>. 
              {cacheHitData.latestAnalysis 
                ? ' A previous scan rating is already logged for this document.' 
                : ' This resume is stored but has not been analyzed.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setCacheHitData(null)}
                className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              
              {/* Force reanalyze */}
              <button 
                onClick={() => triggerAnalysis(cacheHitData.resumeId, true)}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                Scan Again
              </button>

              {/* Reuse cache */}
              {cacheHitData.latestAnalysis ? (
                <button 
                  onClick={() => triggerAnalysis(cacheHitData.resumeId, false)}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Reuse Analysis
                </button>
              ) : (
                <button 
                  onClick={() => triggerAnalysis(cacheHitData.resumeId, false)}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all animate-pulse"
                >
                  Run Analysis Scan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-400" />
              Rename Resume Document
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">New Document Name</label>
              <div className="flex gap-2 bg-slate-950/60 border border-slate-900 rounded-xl p-1">
                <input 
                  type="text" 
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="flex-grow bg-transparent text-sm text-slate-200 px-3 py-2 focus:outline-none"
                  placeholder="e.g. Resume_Revision"
                  disabled={isRenaming}
                />
                <span className="text-xs text-slate-600 px-2 flex items-center font-bold">.pdf</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setRenameTarget(null)}
                disabled={isRenaming}
                className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRename}
                disabled={isRenaming || !renameValue.trim()}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {isRenaming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl border border-rose-900/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-full text-rose-400">
                <ShieldAlert className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Delete Resume Document?</h3>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-900/50">
              Are you sure you want to permanently delete the resume <strong className="text-slate-100">&quot;{deleteTarget.name}&quot;</strong>? This will delete the file from storage and remove all database metadata.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
