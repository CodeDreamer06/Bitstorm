'use client';

import { useState, useEffect } from 'react';
import { usePracticeStore } from '@/store/practiceStore';
import { Pill, PillIndicator } from '@/components/ui/pill';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClockIcon, SettingsIcon } from 'lucide-react';

interface TimerPillProps {
  className?: string;
}

export function TimerPill({ className }: TimerPillProps) {
  const stopwatchStartTime = usePracticeStore(state => state.stopwatchStartTime);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isSettingOpen, setIsSettingOpen] = useState<boolean>(false);
  const [thresholdInput, setThresholdInput] = useState<string>('02:00'); // Default 2 minutes
  const [threshold, setThreshold] = useState<number>(120000); // Default 2 minutes in milliseconds
  
  // Parse input in "mm:ss" format to milliseconds
  const parseTimeThreshold = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return ((isNaN(minutes) ? 0 : minutes) * 60 + (isNaN(seconds) ? 0 : seconds)) * 1000;
  };
  
  // Format milliseconds to "mm:ss" format
  const formatTime = (time: number): string => {
    const totalSeconds = time / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Save the threshold when the input is changed
  const handleSaveThreshold = () => {
    const parsedMs = parseTimeThreshold(thresholdInput);
    if (parsedMs > 0) {
      setThreshold(parsedMs);
      localStorage.setItem('timerThreshold', parsedMs.toString());
    }
    setIsSettingOpen(false);
  };
  
  // Handle input change with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Accept only input in format mm:ss
    if (/^\d{0,2}:?\d{0,2}$/.test(value)) {
      // Format the input as mm:ss if needed
      if (value.includes(':')) {
        setThresholdInput(value);
      } else if (value.length <= 2) {
        setThresholdInput(value);
      } else {
        const minutes = value.slice(0, 2);
        const seconds = value.slice(2);
        setThresholdInput(`${minutes}:${seconds}`);
      }
    }
  };
  
  // Determine the indicator variant based on elapsed time compared to threshold
  const getIndicatorVariant = (): 'success' | 'warning' | 'error' => {
    if (elapsedTime < threshold) {
      return 'success';
    } else if (elapsedTime < threshold * 1.25) { // 25% above threshold
      return 'warning';
    } else {
      return 'error';
    }
  };
  
  // Load saved threshold from localStorage on component mount
  useEffect(() => {
    const savedThreshold = localStorage.getItem('timerThreshold');
    if (savedThreshold) {
      const parsedThreshold = parseInt(savedThreshold, 10);
      setThreshold(parsedThreshold);
      setThresholdInput(formatTime(parsedThreshold));
    }
  }, []);
  
  // Update the elapsed time every 100ms
  useEffect(() => {
    if (!stopwatchStartTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setElapsedTime(now - stopwatchStartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [stopwatchStartTime]);

  return (
    <div className={className}>
      {isSettingOpen ? (
        <div className="flex items-center gap-2">
          <Input
            value={thresholdInput}
            onChange={handleInputChange}
            placeholder="MM:SS"
            className="w-20 h-8 text-center"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8"
            onClick={handleSaveThreshold}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={() => setIsSettingOpen(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Pill className="flex items-center">
          <PillIndicator variant={getIndicatorVariant()} pulse={elapsedTime > threshold} />
          <ClockIcon className="size-3.5 mr-1" />
          {formatTime(elapsedTime)}
          <Button
            variant="ghost"
            size="icon"
            className="size-5 ml-1 p-0"
            onClick={() => setIsSettingOpen(true)}
          >
            <SettingsIcon className="size-3" />
          </Button>
        </Pill>
      )}
    </div>
  );
} 