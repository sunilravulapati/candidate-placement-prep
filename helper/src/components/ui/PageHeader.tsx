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
  gradientFrom = 'from-violet-950/70',
  gradientVia = 'via-indigo-950/45',
  gradientTo = 'to-slate-900/45',
  borderColor = 'border-indigo-400/20',
  glowColor = 'bg-indigo-500/15',
  secondaryGlowColor = 'bg-fuchsia-500/10',
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-[28px] border bg-gradient-to-br p-6 shadow-2xl shadow-slate-950/30 md:p-8',
        gradientFrom,
        gradientVia,
        gradientTo,
        borderColor,
        className,
      )}
    >
      <div
        className={cn(
          'absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full blur-3xl',
          glowColor,
        )}
      />
      <div
        className={cn(
          'absolute -bottom-28 -left-20 -z-10 h-64 w-64 rounded-full blur-3xl',
          secondaryGlowColor,
        )}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.04)_48%,transparent_62%)] opacity-70" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="min-w-0">
          {badge && <div className="mb-4">{badge}</div>}
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="hidden rounded-2xl border border-white/10 bg-white/[0.08] p-3.5 shadow-inner shadow-white/5 sm:block">
                <Icon className={cn('h-7 w-7', iconClassName)} />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300/75">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {actions && (
          <div className="flex w-full shrink-0 flex-wrap items-center gap-3 md:w-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
