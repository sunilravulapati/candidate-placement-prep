import { cn } from '@/lib/cn';

const variants = {
  default: 'bg-slate-800 text-slate-400 border-slate-700',
  primary: 'bg-violet-600/20 text-violet-400 border-violet-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  new: 'bg-fuchsia-600/20 text-fuchsia-400 border-fuchsia-500/20',
  info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
} as const;

export type BadgeVariant = keyof typeof variants;

export function Badge({
  className,
  variant = 'default',
  children,
}: {
  className?: string;
  variant?: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
