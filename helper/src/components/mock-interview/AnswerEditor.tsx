'use client';

// components/mock-interview/AnswerEditor.tsx
// Rich textarea for typing interview answers.
// Features: auto-resize, character count, Ctrl+Enter to submit, word count.

import React, { useRef, useEffect, useCallback } from 'react';
import { Send, SkipForward } from 'lucide-react';

interface AnswerEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onEnd: () => void;
  submittingText?: string;
  disabled?: boolean;
  estimatedTimeSec?: number;
}

const MAX_CHARS = 8000;

export default React.memo(function AnswerEditor({
  value,
  onChange,
  onSubmit,
  onSkip,
  onEnd,
  submittingText,
  disabled = false,
}: AnswerEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 300)}px`;
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!submittingText && value.trim().length > 0) {
          onSubmit();
        }
      }
    },
    [onSubmit, submittingText, value]
  );

  const charCount = value.trim().length;
  // Standard tech interview answers are ~200-500 words. Let's say 1200 chars is a good target.
  const targetChars = 1200; 
  const progress = Math.min(100, (charCount / targetChars) * 100);

  const canSubmit = charCount > 10 && !submittingText && !disabled;

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg shadow-black/20">
      {/* Editor area */}
      <div className="relative flex-1">
        <textarea
          id="answer-textarea"
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          disabled={!!submittingText || disabled}
          placeholder="Type your answer here… (Ctrl+Enter to submit)"
          className="w-full h-full min-h-[220px] bg-transparent text-slate-200 placeholder-slate-600 text-sm leading-relaxed px-5 pt-5 pb-3 resize-none focus:outline-none disabled:opacity-50"
        />
        
        {/* Progress indicator */}
        <div className="absolute bottom-2 right-2 flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${progress > 90 ? 'text-emerald-400' : 'text-slate-500'}`}>
              Depth
            </span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${progress > 90 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <div className="flex gap-2">
          <button
            id="end-interview-btn"
            type="button"
            onClick={onEnd}
            disabled={!!submittingText}
            className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all duration-200 disabled:opacity-40"
          >
            End Interview
          </button>

          <button
            id="skip-question-btn"
            type="button"
            onClick={onSkip}
            disabled={!!submittingText || disabled}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-700 rounded-xl transition-all duration-200 disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>

          <button
            id="submit-answer-btn"
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/20 disabled:shadow-none"
          >
            {submittingText ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {submittingText}
              </span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Submit Answer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});
