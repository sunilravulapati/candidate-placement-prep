import React from 'react';

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'upcoming' | 'error';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = '' }: TimelineProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-800"></div>

      <div className="space-y-6 relative z-10">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          
          let statusColor = 'bg-slate-800 border-slate-700 text-slate-400';
          if (item.status === 'completed') statusColor = 'bg-emerald-900/50 border-emerald-500/50 text-emerald-400';
          if (item.status === 'current') statusColor = 'bg-indigo-900/50 border-indigo-500/50 text-indigo-400';
          if (item.status === 'error') statusColor = 'bg-rose-900/50 border-rose-500/50 text-rose-400';
          if (item.status === 'upcoming') statusColor = 'bg-slate-900 border-slate-800 text-slate-500';

          return (
            <div key={item.id} className="flex gap-4">
              <div className="flex-shrink-0 relative">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${statusColor}`}>
                  {item.icon ? (
                    <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>
              </div>
              <div className={`pt-1 pb-2 ${!isLast ? 'border-b border-slate-800/50' : ''} flex-1`}>
                <div className="flex justify-between items-start">
                  <h4 className={`text-sm font-bold ${item.status === 'upcoming' ? 'text-slate-500' : 'text-slate-200'}`}>
                    {item.title}
                  </h4>
                  {item.date && (
                    <span className="text-[10px] text-slate-500 font-semibold">{item.date}</span>
                  )}
                </div>
                {item.description && (
                  <p className={`mt-1 text-xs ${item.status === 'upcoming' ? 'text-slate-600' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
