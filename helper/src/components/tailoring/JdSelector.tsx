'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Upload, History } from 'lucide-react';
import { pasteJobDescriptionAction, uploadJobDescriptionAction, listJobDescriptionsAction } from '@backend/features/jobDescription/actions';
import { Tabs, Button, Textarea, ErrorCard, SkeletonList } from '@/components/ui';

interface JdSelectorProps {
  onAnalyzed: (jdId: string) => void;
}

export const JdSelector = memo(function JdSelector({ onAnalyzed }: JdSelectorProps) {
  const [mode, setMode] = useState<'paste' | 'upload' | 'history'>('paste');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyJds, setHistoryJds] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'history') return;
    setHistoryLoading(true);
    listJobDescriptionsAction()
      .then(setHistoryJds)
      .catch(() => setError('Failed to load job description history.'))
      .finally(() => setHistoryLoading(false));
  }, [mode]);

  const handlePaste = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter a job description.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await pasteJobDescriptionAction(text);
      if (!res.success || !res.jdId) throw new Error('Failed to save JD');
      onAnalyzed(res.jdId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save job description.');
    } finally {
      setLoading(false);
    }
  }, [text, onAnalyzed]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadJobDescriptionAction(formData);
      if (!res.success || !res.jdId) throw new Error('Failed to upload JD');
      onAnalyzed(res.jdId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setLoading(false);
    }
  }, [onAnalyzed]);

  const handleSelectHistory = useCallback((id: string) => {
    setError(null);
    onAnalyzed(id);
  }, [onAnalyzed]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-12">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="font-medium text-slate-300">Preparing job description...</p>
        <p className="mt-1 text-sm text-slate-500">Saving for tailoring comparison.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
      <Tabs
        items={[
          { id: 'paste', label: 'Paste Text' },
          { id: 'upload', label: 'Upload PDF' },
          { id: 'history', label: 'History', icon: History },
        ]}
        activeId={mode}
        onChange={(id) => setMode(id as typeof mode)}
      />

      <div className="p-6">
        {error && <ErrorCard type="validation" message={error} className="mb-4" onRetry={() => setError(null)} />}

        {mode === 'paste' && (
          <div className="space-y-4">
            <Textarea
              placeholder="Paste the complete job description here..."
              className="h-48"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="Job description text"
            />
            <div className="flex justify-end">
              <Button onClick={handlePaste} disabled={!text.trim()}>
                Continue to Tailoring
              </Button>
            </div>
          </div>
        )}

        {mode === 'upload' && (
          <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 p-10 text-center transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/5">
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Upload job description PDF"
            />
            <div className="mb-4 rounded-full bg-slate-800 p-4 text-indigo-400">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium text-slate-200">Click or drag PDF to upload</h3>
            <p className="text-sm text-slate-500">Max size 5MB. PDF format only.</p>
          </div>
        )}

        {mode === 'history' && (
          <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
            {historyLoading ? (
              <SkeletonList count={3} />
            ) : historyJds.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No previously saved job descriptions.</p>
            ) : (
              historyJds.map((jd) => (
                <div
                  key={jd.id}
                  className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 transition-colors hover:border-slate-600"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="truncate text-sm text-slate-300">
                      {jd.originalText?.substring(0, 50) || 'Uploaded PDF Document'}...
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(jd.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleSelectHistory(jd.id)}>
                    Select
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
});
