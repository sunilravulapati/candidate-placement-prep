'use client';

// components/mock-interview/InterviewSkeleton.tsx
// Loading skeleton for Interview Room and Feedback views.

export function InterviewRoomSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-pulse">
      {/* Left: Transcript skeleton */}
      <div className="lg:w-[35%] bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 space-y-4 min-h-[400px]">
        <div className="h-3 bg-slate-800 rounded w-20" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-slate-800 rounded-full shrink-0" />
              <div className="flex-1 h-16 bg-slate-800/60 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Center: Question + Answer skeleton */}
      <div className="lg:flex-1 flex flex-col gap-4">
        <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-3 bg-slate-800 rounded w-32" />
            <div className="h-5 bg-slate-800 rounded w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-800 rounded w-full" />
            <div className="h-4 bg-slate-800 rounded w-4/5" />
            <div className="h-4 bg-slate-800 rounded w-3/5" />
          </div>
          <div className="h-12 bg-slate-800/40 rounded-xl" />
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl h-36" />
      </div>

      {/* Right: Sidebar skeleton */}
      <div className="lg:w-60 space-y-4">
        <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-4 h-32 flex items-center justify-center">
          <div className="w-24 h-24 bg-slate-800 rounded-full" />
        </div>
        <div className="bg-slate-900/70 border border-slate-800/60 rounded-2xl p-4 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-3 bg-slate-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedbackSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl h-48" />
        ))}
      </div>
      <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl h-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2].map(i => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/60 rounded-2xl h-40" />
        ))}
      </div>
    </div>
  );
}
