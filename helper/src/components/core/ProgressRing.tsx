import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string | React.ReactNode;
  subtitle?: string;
  colorClass?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  label,
  subtitle,
  colorClass = 'stroke-violet-500',
  className = '',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke="#1e293b" // slate-800
          strokeWidth={strokeWidth} 
          fill="transparent" 
        />
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          className={colorClass}
          strokeWidth={strokeWidth} 
          fill="transparent" 
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {label ? (
          <div className="font-extrabold text-white text-2xl">{label}</div>
        ) : (
          <div className="font-extrabold text-white text-2xl">{Math.round(progress)}%</div>
        )}
        {subtitle && (
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
}
