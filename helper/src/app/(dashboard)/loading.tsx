import { SkeletonCard } from '@/components/ui';

export default function Loading() {
  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8 space-y-3">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-800" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-lg bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonCard className="h-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-48" />
        </div>
      </div>
    </div>
  );
}
