import { Progress } from '@/components/ui/progress';
import { Weekend } from '@/hooks/useWeekendsData';

interface ProgressHeaderProps {
  weekends: Weekend[];
}

export function ProgressHeader({ weekends }: ProgressHeaderProps) {
  const completedCount = weekends.filter(w => w.is_complete).length;
  const progressPercent = (completedCount / 10) * 100;

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Resolution Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your 10-weekend journey</p>
          </div>
          <div className="flex items-center gap-4 sm:min-w-[280px]">
            <Progress value={progressPercent} className="h-3 flex-1" />
            <span className="text-sm font-medium text-foreground tabular-nums">
              {completedCount}/10 ({Math.round(progressPercent)}%)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
