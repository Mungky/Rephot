'use client';

import { useEffect, useState } from 'react';

interface LibraryProgressCardProps {
  style: string;
  startedAt: number;
}

function computeProgress(startedAt: number): number {
  const elapsed = (Date.now() - startedAt) / 1000;
  if (elapsed < 3) return (elapsed / 3) * 15;
  if (elapsed < 15) return 15 + ((elapsed - 3) / 12) * 40;
  if (elapsed < 40) return 55 + ((elapsed - 15) / 25) * 25;
  if (elapsed < 120) return 80 + ((elapsed - 40) / 80) * 12;
  return 92;
}

export function LibraryProgressCard({ style, startedAt }: LibraryProgressCardProps) {
  const [progress, setProgress] = useState(() => computeProgress(startedAt));

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(Math.min(computeProgress(startedAt), 92));
    }, 300);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <div className="aspect-square bg-[#0A0A0A] rounded-xl shadow-sm border border-neutral-700 overflow-hidden relative flex flex-col items-center justify-center gap-2.5 p-3">
      <div className="w-8 h-8 border-[3px] border-neutral-700 border-t-white rounded-full animate-spin" />
      <span className="text-[11px] font-semibold text-white text-center truncate w-full">
        {style}
      </span>
      <span className="text-xs text-white/60 font-mono tabular-nums">
        {Math.round(progress)}%
      </span>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-white rounded-r-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
