import { cn } from '@/lib/cn';
import React from 'react';

export function MetricGrid({
  children,
  className,
  columns = 4,
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        {
          'grid-cols-2': columns === 2,
          'grid-cols-2 md:grid-cols-3': columns === 3,
          'grid-cols-2 md:grid-cols-4': columns === 4,
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-5': columns === 5,
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-6': columns === 6,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
