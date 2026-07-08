// src/app/questions/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { getQuestionByIdAction, updateQuestionProgressAction } from '@backend/features/dsa/actions';
import { ChevronLeft, Play, Save, CheckCircle2, FileEdit, HelpCircle, Code2, Layers } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui';

export default function QuestionWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const questionId = parseInt(resolvedParams.id, 10);

  const [question, setQuestion] = useState<any>(null);
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'notes'>('description');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuestion() {
      try {
        const q = await getQuestionByIdAction(questionId) as any;
        if (!q) {
          router.push('/questions');
          return;
        }
        setQuestion(q);
        // If user already had progress, load it
        const progress = q.progress && q.progress[0];
        setCode(progress?.code || q.solutionStub || '// Start typing your solution...');
        setNotes(progress?.notes || '');
      } catch {
        router.push('/questions');
      } finally {
        setIsLoading(false);
      }
    }
    loadQuestion();
  }, [questionId, router]);

  const handleSaveProgress = async (status: 'in_progress' | 'completed') => {
    setIsSubmitting(true);
    setSubmitMessage('');
    try {
      await updateQuestionProgressAction(questionId, {
        status,
        code,
        notes,
      });
      setSubmitMessage(status === 'completed' ? 'Solution submitted successfully! 🎉' : 'Progress saved. 💾');
      // Refresh details to update header progress states
      const updatedQ = await getQuestionByIdAction(questionId) as any;
      if (updatedQ) setQuestion(updatedQ);
    } catch {
      setSubmitMessage('Error saving progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'medium': return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'hard': return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
    }
  };

  const currentStatus = question?.progress?.[0]?.status || 'not_started';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Workspace Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950/20 border border-slate-900/60 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <Link href="/questions" className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 p-2 rounded-xl transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md uppercase">
                {question.category}
              </span>
            </div>
            <h1 className="text-base font-bold text-slate-100 mt-1">{question.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {submitMessage && (
            <span className="text-xs text-violet-400 font-medium mr-2 animate-fade-in">{submitMessage}</span>
          )}
          <button 
            onClick={() => handleSaveProgress('in_progress')}
            disabled={isSubmitting}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button 
            onClick={() => handleSaveProgress('completed')}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-600/10 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submit Solution</span>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
        
        {/* Left Side Panel (Tabs: Description & Notes) */}
        <div className="glass-card rounded-2xl flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-900 bg-slate-950/20 px-4">
            <button 
              onClick={() => setActiveTab('description')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'description' 
                  ? 'border-violet-500 text-violet-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Description
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'notes' 
                  ? 'border-violet-500 text-violet-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              Personal Notes
            </button>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-6">
            {activeTab === 'description' ? (
              <div className="space-y-6">
                {/* Description Text */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Problem Statement</h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {question.description}
                  </p>
                </div>

                {/* Question Info / Tags */}
                {question.companies && question.companies.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-900/60">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      Asked by Companies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {question.companies.map((company: string) => (
                        <span key={company} className="text-[10px] text-slate-300 bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-lg">
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Scratchpad / Interview Notes</h3>
                  <span className="text-[10px] text-slate-500">Auto-saved as draft</span>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down hints, code complexities, or notes here..."
                  className="flex-grow w-full bg-slate-950/40 border border-slate-900 rounded-2xl p-4 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side Panel: Code Sandbox Editor */}
        <div className="glass-card rounded-2xl flex flex-col overflow-hidden border border-slate-900/40">
          <div className="flex justify-between items-center border-b border-slate-900 bg-slate-950/20 px-6 py-3">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-violet-400" />
              Source Code Workspace
            </span>
            <span className="text-[10px] text-slate-500 font-mono">JavaScript (ES6)</span>
          </div>

          <div className="flex-grow p-4 relative flex flex-col">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-grow w-full bg-slate-950/60 border border-slate-900 rounded-xl p-4 font-mono text-sm text-indigo-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/40 resize-none leading-relaxed"
              spellCheck="false"
            />
          </div>

          <div className="bg-slate-950/30 px-6 py-4 border-t border-slate-900/40 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-medium">Click submit to save solution state</span>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSaveProgress('in_progress')}
                disabled={isSubmitting}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs px-4 py-2 rounded-xl transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
