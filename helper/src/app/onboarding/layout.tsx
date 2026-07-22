import React from 'react';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Complete Your Profile — PrepGenie',
  description: 'Set up your PrepGenie profile to get personalized recommendations',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center gap-3">
        <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none">PrepGenie</h1>
          <p className="text-indigo-400 text-[10px] font-semibold tracking-wider uppercase">Placement OS</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center p-4 md:p-8 pt-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
