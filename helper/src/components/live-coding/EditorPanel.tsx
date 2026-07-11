'use client';

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Settings, Maximize2, RefreshCw, Type, Moon, Sun, Monitor } from 'lucide-react';
import { cn } from './CodingWorkspace';

const defaultCode = `function twoSum(nums: number[], target: number): number[] {
    // Write your code here
    
};`;

export default function EditorPanel({ 
  code, 
  onChange,
  onRun,
  onSubmit
}: { 
  code?: string, 
  onChange?: (val: string) => void,
  onRun?: () => void,
  onSubmit?: () => void
}) {
  const [language, setLanguage] = useState('typescript');
  const [localCode, setLocalCode] = useState(defaultCode);
  const currentCode = code !== undefined ? code : localCode;
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [theme, setTheme] = useState<'vs-dark' | 'light' | 'hc-black'>('vs-dark');

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setLocalCode(value);
      onChange?.(value);
    }
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    // Add Ctrl+S or Cmd+S
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Typically auto-saved, but can hook to external save here
      // console.log('Saved');
    });

    // Add Ctrl+Enter or Cmd+Enter for Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun?.();
    });

    // Add Ctrl+Shift+Enter for Submit
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      onSubmit?.();
    });
  };

  const handleReset = () => {
    setLocalCode(defaultCode);
    onChange?.(defaultCode);
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-slate-800 text-slate-200 text-sm rounded-md px-2 py-1 border border-slate-700 outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="typescript">TypeScript</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>

        <div className="flex items-center gap-2 relative">
          <button onClick={handleReset} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors" title="Reset Code">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors" 
            title="Settings"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </button>
          
          {showSettings && (
            <div className="absolute top-10 right-8 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 p-4 flex flex-col gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Theme</label>
                <div className="flex gap-2">
                  <button onClick={() => setTheme('vs-dark')} className={cn("flex-1 py-1.5 rounded-lg text-sm border", theme === 'vs-dark' ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-900 border-slate-700 text-slate-400")}>Dark</button>
                  <button onClick={() => setTheme('light')} className={cn("flex-1 py-1.5 rounded-lg text-sm border", theme === 'light' ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-900 border-slate-700 text-slate-400")}>Light</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Font Size</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
                  <span className="text-slate-300 text-sm w-6 text-right">{fontSize}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Tab Size</label>
                <div className="flex gap-2">
                  <button onClick={() => setTabSize(2)} className={cn("flex-1 py-1 rounded-lg text-sm border", tabSize === 2 ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-900 border-slate-700 text-slate-400")}>2</button>
                  <button onClick={() => setTabSize(4)} className={cn("flex-1 py-1 rounded-lg text-sm border", tabSize === 4 ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-900 border-slate-700 text-slate-400")}>4</button>
                </div>
              </div>
            </div>
          )}

          <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors" title="Fullscreen">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={currentCode}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: fontSize,
            tabSize: tabSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: Math.round(fontSize * 1.5),
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            wordWrap: 'on',
          }}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
