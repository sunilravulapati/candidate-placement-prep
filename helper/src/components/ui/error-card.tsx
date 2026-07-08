import { AlertCircle, RefreshCw, WifiOff, Database, CloudOff, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from './button';

export type ErrorType = 'network' | 'database' | 'validation' | 'upload' | 'ai-timeout' | 'cloudinary' | 'generic';

const config: Record<ErrorType, { icon: typeof AlertCircle; title: string }> = {
  network: { icon: WifiOff, title: 'Connection Error' },
  database: { icon: Database, title: 'Database Error' },
  validation: { icon: ShieldAlert, title: 'Validation Error' },
  upload: { icon: CloudOff, title: 'Upload Failed' },
  'ai-timeout': { icon: Clock, title: 'AI Request Timed Out' },
  cloudinary: { icon: CloudOff, title: 'Storage Error' },
  generic: { icon: AlertCircle, title: 'Something Went Wrong' },
};

export function ErrorCard({
  type = 'generic',
  message,
  onRetry,
  className,
}: {
  type?: ErrorType;
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  const { icon: Icon, title } = config[type];

  return (
    <div
      className={cn(
        'rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 sm:p-5',
        className
      )}
      role="alert"
    >
      <div className="flex gap-3">
        <Icon className="h-5 w-5 shrink-0 text-rose-400" aria-hidden />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-rose-300">{title}</h3>
          <p className="mt-1 text-sm text-rose-400/90">{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-3 border-rose-500/30 text-rose-300 hover:text-rose-200">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
