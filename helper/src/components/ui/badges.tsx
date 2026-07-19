import { cn } from '@/lib/cn';
import { Badge, type BadgeVariant } from './badge';
import { CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';

export function DifficultyBadge({ difficulty, className }: { difficulty: string, className?: string }) {
  const d = difficulty.toLowerCase();
  let variant: BadgeVariant = 'default';
  
  if (d === 'easy') variant = 'success';
  if (d === 'medium') variant = 'warning';
  if (d === 'hard') variant = 'danger';
  
  return <Badge variant={variant} className={className}>{difficulty}</Badge>;
}

export function TopicBadge({ topic, className }: { topic: string, className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/50', className)}>
      <FileText className="w-3 h-3 text-slate-500" />
      {topic}
    </span>
  );
}

export function CompanyBadge({ company, className }: { company: string, className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20', className)}>
      {company}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: 'completed' | 'in-progress' | 'failed' | 'not-started' | string, className?: string }) {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'accepted') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-semibold text-emerald-400', className)}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }
  
  if (s === 'in-progress' || s === 'active') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-semibold text-amber-400', className)}>
        <Clock className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  if (s === 'failed' || s === 'rejected') {
    return (
      <span className={cn('inline-flex items-center gap-1 text-xs font-semibold text-rose-400', className)}>
        <XCircle className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center text-xs font-semibold text-slate-400', className)}>
      {status}
    </span>
  );
}
