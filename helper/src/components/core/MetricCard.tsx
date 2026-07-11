import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  variant = 'default',
  className = ''
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-slate-900/60 border-slate-800',
    primary: 'bg-indigo-950/40 border-indigo-500/20',
    success: 'bg-emerald-950/40 border-emerald-500/20',
    warning: 'bg-amber-950/40 border-amber-500/20',
    danger: 'bg-rose-950/40 border-rose-500/20',
  };

  const iconColors = {
    default: 'text-slate-400',
    primary: 'text-indigo-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-rose-400',
  };

  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-md flex flex-col justify-between shadow-lg ${variantStyles[variant]} ${className}`}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</h4>
          <div className="mt-2 text-2xl font-black text-white">{value}</div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl bg-slate-950/50 ${iconColors[variant]}`}>
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={`font-bold ${trend.value > 0 ? 'text-emerald-400' : trend.value < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
