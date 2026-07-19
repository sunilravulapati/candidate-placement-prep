import React from 'react';
import { cn } from '@/lib/cn';
import { FileQuestion } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  title,
  description,
  icon: Icon = FileQuestion,
  action,
  className,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20', className)}>
      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-200 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
