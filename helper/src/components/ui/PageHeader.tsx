import React from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  borderColor?: string;
  glowColor?: string;
  secondaryGlowColor?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconClassName,
  badge,
  actions,
  gradientFrom = 'from-violet-950/60',
  gradientVia = 'via-indigo-950/40',
  gradientTo = 'to-slate-900/30',
  borderColor = 'border-indigo-500/20',
  glowColor = 'bg-indigo-500/10',
  secondaryGlowColor,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-r p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl border',
        gradientFrom,
        gradientVia,
        gradientTo,
        borderColor,
        className
      )}
    >
      <div className={cn('absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl', glowColor)} />
      {secondaryGlowColor && (
        <div className={cn('absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl', secondaryGlowColor)} />
      )}
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {badge && <div className="mb-3">{badge}</div>}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            {Icon && <Icon className={cn('w-8 h-8', iconClassName)} />}
            {title}
          </h1>
          {description && (
            <p className="text-slate-400 text-sm mt-1 max-w-xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
