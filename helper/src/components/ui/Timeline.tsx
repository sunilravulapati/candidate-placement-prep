import React from 'react';
import { cn } from '@/lib/cn';

export interface TimelineItemProps {
  title: string;
  description?: string;
  time?: string;
  iconColor?: string; // e.g. bg-fuchsia-500
}

export function Timeline({
  items,
  className,
}: {
  items: TimelineItemProps[];
  className?: string;
}) {
  return (
    <div className={cn('relative pl-4 space-y-5 before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] before:bg-slate-800', className)}>
      {items.map((item, idx) => (
        <div key={idx} className="relative">
          <div className={cn('absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-[#030712] ring-2 ring-slate-500/20', item.iconColor || 'bg-slate-600')}></div>
          <div>
            <p className="text-xs font-bold text-slate-200">{item.title}</p>
            {item.description && <p className="text-[10px] text-slate-400 mt-0.5">{item.description}</p>}
            {item.time && <p className="text-[10px] text-slate-500 mt-1">{item.time}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
