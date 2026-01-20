export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return [hours, minutes, seconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
}

export function calculateElapsedSeconds(timerStartedAt: string | null, totalTimeSeconds: number): number {
  if (!timerStartedAt) return totalTimeSeconds;
  
  const startTime = new Date(timerStartedAt).getTime();
  const now = Date.now();
  const elapsedSinceStart = Math.floor((now - startTime) / 1000);
  
  return totalTimeSeconds + elapsedSinceStart;
}
