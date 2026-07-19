import React from 'react';
import { cn } from '@/lib/cn';

export function ProgressRing({
  progress,
  label,
  sublabel,
  color = 'text-indigo-500',
  size = 112, // 28 * 4
  strokeWidth = 10,
  className,
}: {
  progress: number;
  label: string | React.ReactNode;
  sublabel?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (circumference * progress) / 100;
  const center = size / 2;

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-1000', color)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-2xl font-bold text-white">{label}</span>
          {sublabel && <span className="text-xs text-slate-500">{sublabel}</span>}
        </div>
      </div>
    </div>
  );
}
