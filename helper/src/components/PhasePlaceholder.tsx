// src/components/PhasePlaceholder.tsx
import { Sparkles, LucideIcon } from 'lucide-react';

interface PhasePlaceholderProps {
  title: string;
  description: string;
  phase: string;
  icon: LucideIcon;
}

export default function PhasePlaceholder({ title, description, phase, icon: Icon }: PhasePlaceholderProps) {
  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-6">
      <div className="inline-flex bg-violet-600/10 p-5 rounded-2xl border border-violet-500/20 text-violet-400">
        <Icon className="w-12 h-12" />
      </div>
      
      <div className="space-y-2">
        <span className="text-[10px] bg-violet-600/20 text-violet-400 border border-violet-500/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {phase}
        </span>
        <h2 className="text-2xl font-extrabold text-slate-100">{title}</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-md mx-auto text-xs text-slate-500 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <span>This premium AI module will be activated in subsequent evolution phases.</span>
      </div>
    </div>
  );
}
