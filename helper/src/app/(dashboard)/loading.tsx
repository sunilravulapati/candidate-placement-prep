import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative z-10 shadow-xl">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      </div>
      <h2 className="mt-6 text-lg font-bold text-slate-200 tracking-tight">Loading Workspace...</h2>
      <p className="text-sm text-slate-500 mt-1">Preparing your tools and dashboard metrics.</p>
      
      {/* Skeletons to mimic dashboard structure */}
      <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
