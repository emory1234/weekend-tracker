import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { formatTime, calculateElapsedSeconds } from '@/lib/timeUtils';
import { Weekend, useUpdateWeekend } from '@/hooks/useWeekendsData';

interface WeekendTimerProps {
  weekend: Weekend;
}

export function WeekendTimer({ weekend }: WeekendTimerProps) {
  const updateWeekend = useUpdateWeekend();
  const isRunning = !!weekend.timer_started_at;
  
  const [displayTime, setDisplayTime] = useState(() =>
    calculateElapsedSeconds(weekend.timer_started_at, weekend.total_time_seconds)
  );

  useEffect(() => {
    if (!isRunning) {
      setDisplayTime(weekend.total_time_seconds);
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime(calculateElapsedSeconds(weekend.timer_started_at, weekend.total_time_seconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, weekend.timer_started_at, weekend.total_time_seconds]);

  const handleToggle = () => {
    if (isRunning) {
      // Stop timer - calculate total time and clear start timestamp
      const totalTime = calculateElapsedSeconds(weekend.timer_started_at, weekend.total_time_seconds);
      updateWeekend.mutate({
        id: weekend.id,
        total_time_seconds: totalTime,
        timer_started_at: null,
      });
    } else {
      // Start timer - set the start timestamp
      updateWeekend.mutate({
        id: weekend.id,
        timer_started_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        variant={isRunning ? 'secondary' : 'default'}
        onClick={handleToggle}
        className="gap-2"
      >
        {isRunning ? (
          <>
            <Pause className="h-4 w-4" />
            Stop
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Start
          </>
        )}
      </Button>
      <div className="flex items-center gap-2">
        {isRunning && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
          </span>
        )}
        <span className="font-mono text-lg font-semibold text-foreground tabular-nums">
          {formatTime(displayTime)}
        </span>
      </div>
    </div>
  );
}
