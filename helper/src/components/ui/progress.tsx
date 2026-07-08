import { cn } from '@/lib/cn';

export function Progress({
  value,
  className,
  indicatorClassName,
  size = 'md',
}: {
  value: number;
  className?: string;
  indicatorClassName?: string;
  size?: 'sm' | 'md';
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-full bg-slate-800',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500',
          indicatorClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
