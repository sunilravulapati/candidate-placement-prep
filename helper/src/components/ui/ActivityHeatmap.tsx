import React from 'react';
import { cn } from '@/lib/cn';
import { Calendar } from 'lucide-react';

export function ActivityHeatmap({
  heatmap,
  loading = false,
  className,
}: {
  heatmap: number[][];
  loading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-3xl p-6', className)}>
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-indigo-400" /> Activity Heatmap
      </h2>
      {!loading && heatmap && heatmap.length > 0 ? (
        <div className="flex flex-col gap-1.5 overflow-x-auto no-scrollbar">
          {heatmap.map((row, r) => (
            <div key={r} className="flex gap-1.5">
              {row.map((level, c) => (
                <div
                  key={c}
                  title={`Activity: ${(level * 100).toFixed(0)}%`}
                  className={cn(
                    'w-3 h-3 rounded-sm transition-colors',
                    level > 0.8 ? 'bg-indigo-400' :
                    level > 0.5 ? 'bg-indigo-600' :
                    level > 0.3 ? 'bg-indigo-900/80' :
                    level > 0   ? 'bg-indigo-950' :
                    'bg-slate-800'
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center text-slate-600 text-sm animate-pulse">
          Loading activity...
        </div>
      )}
    </div>
  );
}
