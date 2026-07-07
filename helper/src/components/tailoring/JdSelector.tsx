'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, Check, History } from 'lucide-react';
import { analyzeJobDescriptionAction, pasteJobDescriptionAction, uploadJobDescriptionAction, listJobDescriptionsAction } from '@backend/features/jobDescription/actions';

interface JdSelectorProps {
  onAnalyzed: (jdId: string, jdData: any) => void;
}

export function JdSelector({ onAnalyzed }: JdSelectorProps) {
  const [mode, setMode] = useState<'paste' | 'upload' | 'history'>('paste');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [historyJds, setHistoryJds] = useState<any[]>([]);

  useEffect(() => {
    if (mode === 'history') {
      listJobDescriptionsAction().then(jds => setHistoryJds(jds)).catch(console.error);
    }
  }, [mode]);

  const handleAnalyzePaste = async () => {
    if (!text.trim()) {
      setError('Please enter a job description.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await pasteJobDescriptionAction(text);
      if (!res.success || !res.jdId) throw new Error('Failed to save JD');
      
      const analysisRes = await analyzeJobDescriptionAction(res.jdId);
      onAnalyzed(res.jdId, analysisRes.analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadJobDescriptionAction(formData);
      if (!res.success || !res.jdId) throw new Error('Failed to upload JD');

      const analysisRes = await analyzeJobDescriptionAction(res.jdId);
      onAnalyzed(res.jdId, analysisRes.analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const analysisRes = await analyzeJobDescriptionAction(id);
      onAnalyzed(id, analysisRes.analysis);
    } catch (err: any) {
      setError(err.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-xl border border-slate-800">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-300 font-medium">Analyzing Job Description...</p>
        <p className="text-slate-500 text-sm mt-1">Extracting skills, technologies, and requirements.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setMode('paste')} 
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'paste' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'}`}
        >
          Paste Text
        </button>
        <button 
          onClick={() => setMode('upload')} 
          className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'upload' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'}`}
        >
          Upload PDF
        </button>
        <button 
          onClick={() => setMode('history')} 
          className={`flex-1 flex items-center justify-center py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'history' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'}`}
        >
          <History className="w-4 h-4 mr-2" />
          History
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
            {error}
          </div>
        )}

        {mode === 'paste' && (
          <div className="space-y-4">
            <textarea 
              placeholder="Paste the complete job description here..."
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                onClick={handleAnalyzePaste}
                disabled={!text.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                Analyze JD
              </button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleAnalyzeUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="bg-slate-800 p-4 rounded-full mb-4 text-indigo-400">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-slate-200 font-medium mb-1">Click or drag PDF to upload</h3>
            <p className="text-slate-500 text-sm">Max size 5MB. PDF format only.</p>
          </div>
        )}

        {mode === 'history' && (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {historyJds.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No previously saved job descriptions.</p>
            ) : (
              historyJds.map(jd => (
                <div key={jd.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-600 transition-colors flex items-center justify-between group">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm text-slate-300 truncate">{jd.originalText?.substring(0, 50) || 'Uploaded PDF Document'}...</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(jd.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleSelectHistory(jd.id)}
                    className="px-3 py-1.5 bg-slate-800 text-indigo-400 hover:bg-slate-700 hover:text-indigo-300 text-xs font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Select
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
