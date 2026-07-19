'use client';

import React, { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Settings, Maximize2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  LANGUAGE_CONFIG,
  getStarterTemplate,
  type SupportedLanguage,
} from '@/features/live-coding/language-config';

interface EditorPanelProps {
  /** Controlled language — owned by CodingWorkspace */
  language: SupportedLanguage;
  /** Controlled code value — owned by CodingWorkspace */
  code: string;
  onCodeChange: (code: string) => void;
  /** Problem-specific starters for accurate reset behaviour */
  problemStarters?: Record<string, string> | null;
  /** Keyboard shortcut callbacks */
  onRun?: () => void;
  onSubmit?: () => void;
  onSave?: () => void;
}

export default function EditorPanel({
  language,
  code,
  onCodeChange,
  problemStarters,
  onRun,
  onSubmit,
  onSave,
}: EditorPanelProps) {
  // ── Editor cosmetics are purely local state ────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [theme, setTheme] = useState<'vs-dark' | 'light' | 'hc-black'>('vs-dark');

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) onCodeChange(value);
    },
    [onCodeChange]
  );

  const handleEditorMount = useCallback(
    (editor: unknown, monaco: { KeyMod: { CtrlCmd: number; Shift: number }; KeyCode: { Enter: number; KeyS: number } }) => {
      const ed = editor as { addCommand: (binding: number, handler: () => void) => void };
      // Ctrl+Enter → Run
      ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        onRun?.();
      });
      // Shift+Enter → Submit
      ed.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
        onSubmit?.();
      });
      // Ctrl+S → Save Draft
      ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave?.();
      });
    },
    [onRun, onSubmit, onSave]
  );

  const handleReset = useCallback(() => {
    onCodeChange(getStarterTemplate(language, problemStarters));
  }, [language, problemStarters, onCodeChange]);

  const config = LANGUAGE_CONFIG[language];

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Toolbar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <span className="text-xs text-slate-500 font-mono">{config?.defaultFileName}</span>

        <div className="flex items-center gap-1 relative">
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Reset to starter code"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Editor Settings"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="absolute top-10 right-8 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-4 flex flex-col gap-4">
              {/* Theme */}
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                  Theme
                </label>
                <div className="flex gap-2">
                  {(['vs-dark', 'light'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg text-sm border transition-colors',
                        theme === t
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      )}
                    >
                      {t === 'vs-dark' ? 'Dark' : 'Light'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                  Font Size
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="text-slate-300 text-sm w-6 text-right">{fontSize}</span>
                </div>
              </div>

              {/* Tab Size */}
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">
                  Tab Size
                </label>
                <div className="flex gap-2">
                  {([2, 4] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setTabSize(size)}
                      className={cn(
                        'flex-1 py-1 rounded-lg text-sm border transition-colors',
                        tabSize === size
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <button
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 w-full bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={config?.monacoId ?? 'javascript'}
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize,
            tabSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: Math.round(fontSize * 1.55),
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            formatOnPaste: true,
            wordWrap: 'on',
          }}
          loading={
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
              Loading editor…
            </div>
          }
        />
      </div>
    </div>
  );
}
