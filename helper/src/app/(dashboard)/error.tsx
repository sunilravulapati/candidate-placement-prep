'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-100">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset} variant="primary">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
        <Button onClick={() => router.push('/dashboard')} variant="secondary">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
