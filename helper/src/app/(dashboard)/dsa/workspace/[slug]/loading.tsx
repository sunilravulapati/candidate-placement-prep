import { Code2 } from 'lucide-react';

export default function LoadingWorkspaceProblem() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Code2 className="w-8 h-8 text-indigo-400 animate-pulse" />
        <span className="text-slate-400 font-medium">Loading Problem...</span>
      </div>
    </div>
  );
}
