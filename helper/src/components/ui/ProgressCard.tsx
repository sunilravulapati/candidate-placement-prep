import React from 'react';
import { cn } from '@/lib/cn';
import { ProgressRing } from './ProgressRing';

export interface ProgressItem {
  label: string;
  value: number;
  total: number;
  color?: string; // e.g. bg-emerald-400
}

export function ProgressCard({
  title,
  items,
  ringProgress,
  ringLabel,
  ringSublabel,
  ringColor = 'text-indigo-500',
  className,
}: {
  title: string;
  items: ProgressItem[];
  ringProgress?: number;
  ringLabel?: string | React.ReactNode;
  ringSublabel?: string;
  ringColor?: string;
  className?: string;
}) {
  return (
    <div className={cn('bg-slate-900/50 border border-slate-800 rounded-3xl p-6', className)}>
      <h2 className="text-lg font-bold text-white mb-5">{title}</h2>

      {ringProgress !== undefined && (
        <div className="flex items-center justify-center mb-5">
          <ProgressRing 
            progress={ringProgress} 
            label={ringLabel || `${ringProgress}%`} 
            sublabel={ringSublabel}
            color={ringColor}
            size={112}
            strokeWidth={10}
          />
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => {
          const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="capitalize text-slate-300 font-medium">{item.label}</span>
                <span className="text-slate-400">
                  <span className="text-white font-semibold">{item.value}</span> / {item.total}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', item.color || 'bg-indigo-400')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
