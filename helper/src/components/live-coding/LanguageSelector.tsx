'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  LANGUAGE_CONFIG,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/features/live-coding/language-config';
import { cn } from '@/lib/cn';

const LANG_ICONS: Record<SupportedLanguage, string> = {
  cpp: '⚙',
  java: '☕',
  python: '🐍',
  javascript: '⬡',
};

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  className?: string;
}

export default function LanguageSelector({
  value,
  onChange,
  className,
}: LanguageSelectorProps) {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SupportedLanguage)}
        aria-label="Select language"
        className="appearance-none bg-slate-800 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-1.5 border border-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer hover:border-slate-600 hover:bg-slate-700"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {LANG_ICONS[lang]}  {LANGUAGE_CONFIG[lang].label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}
