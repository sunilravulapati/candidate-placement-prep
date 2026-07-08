import { cn } from '@/lib/cn';
import { Badge } from './badge';

export function SectionHeader({
  badge,
  badgeVariant = 'info',
  title,
  description,
  actions,
  className,
}: {
  badge?: string;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'new' | 'info';
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end md:justify-between', className)}>
      <div>
        {badge && (
          <Badge variant={badgeVariant} className="mb-3">
            {badge}
          </Badge>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 md:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
    </div>
  );
}
