import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

export function MetricCard({
  label,
  value,
  suffix,
  icon: Icon,
  iconColor = 'text-violet-400',
  iconBg = 'bg-violet-600/10 border-violet-500/20',
  badge,
  badgeColor = 'text-slate-500 bg-slate-800',
  progress,
  accent = 'from-violet-500/5',
  className,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: string;
  badgeColor?: string;
  progress?: number;
  accent?: string;
  className?: string;
}) {
  return (
    <div className={cn('glass-card p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity', accent)} />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={cn('p-3 rounded-xl border', iconBg, iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          {badge && (
            <span className={cn('text-xs font-bold px-2 py-1 rounded-lg', badgeColor)}>{badge}</span>
          )}
        </div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
          {suffix && <span className="text-lg text-slate-500">{suffix}</span>}
        </div>
        {progress !== undefined && (
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
