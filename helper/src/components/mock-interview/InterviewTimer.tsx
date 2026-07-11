'use client';

// components/mock-interview/InterviewTimer.tsx
// Isolated, memoized timer component to prevent re-rendering the whole InterviewRoom or Sidebar.

import React, { useState, useEffect, useRef } from 'react';

interface InterviewTimerProps {
  startedAt: Date;
  totalMinutes: number;
  onExpire?: () => void;
}

const InterviewTimer = React.memo(function InterviewTimer({ startedAt, totalMinutes, onExpire }: InterviewTimerProps) {
  const [elapsed, setElapsed] = useState(
    Math.floor((Date.now() - startedAt.getTime()) / 1000)
  );

  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const totalSecs = totalMinutes * 60;
    const interval = setInterval(() => {
      const currentElapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setElapsed(currentElapsed);
      
      if (currentElapsed >= totalSecs && !expiredRef.current) {
        expiredRef.current = true;
        if (onExpireRef.current) {
          onExpireRef.current();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, totalMinutes]);

  const total = totalMinutes * 60;
  const remaining = Math.max(0, total - elapsed);
  const percent = Math.min(100, (elapsed / total) * 100);
  const isWarning = remaining < 300; // < 5 min
  const isCritical = remaining < 120; // < 2 min

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const fmtRemaining = fmt(remaining);
  
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#8b5cf6';

  return (
    <div className="bg-slate-900/70 border border-slate-800/70 rounded-2xl p-4 flex flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
            <circle cx="44" cy="44" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
            <circle
              cx="44" cy="44" r={r}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold font-mono ${isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-200'}`}>
              {fmtRemaining}
            </span>
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">remaining</span>
          </div>
        </div>
      </div>
      {isCritical && (
        <div className="text-xs text-rose-400 font-semibold animate-pulse">
          Time running out!
        </div>
      )}
    </div>
  );
});

export default InterviewTimer;
