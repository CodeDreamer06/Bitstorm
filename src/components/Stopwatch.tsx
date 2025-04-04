'use client';

import { useEffect, useState } from 'react';
import { usePracticeStore } from '@/store/practiceStore';

export function Stopwatch() {
  const stopwatchStartTime = usePracticeStore(state => state.stopwatchStartTime);
  const startStopwatch = usePracticeStore(state => state.startStopwatch);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Start the stopwatch automatically when the component mounts
  useEffect(() => {
    if (!stopwatchStartTime) {
      startStopwatch();
    }
  }, [stopwatchStartTime, startStopwatch]);

  // Update the elapsed time every 100ms
  useEffect(() => {
    if (!stopwatchStartTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedTime(now - stopwatchStartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [stopwatchStartTime]);

  // Format elapsed time as mm:ss.ms
  const formatTime = (time: number): string => {
    const totalSeconds = time / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((time % 1000) / 10); // Get only 2 digits

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-xl font-mono">
      <span>{formatTime(elapsedTime)}</span>
    </div>
  );
} 