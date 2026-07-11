import React from 'react';

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, label, icon, className = '' }: StatusBadgeProps) {
  const statusStyles: Record<BadgeStatus, string> = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    info: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    neutral: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${statusStyles[status]} ${className}`}>
      {icon && <span className="flex-shrink-0 w-3 h-3">{icon}</span>}
      {label}
    </span>
  );
}
