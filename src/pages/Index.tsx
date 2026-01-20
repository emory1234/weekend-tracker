import { useWeekends } from '@/hooks/useWeekendsData';
import { ProgressHeader } from '@/components/ProgressHeader';
import { WeekendCard } from '@/components/WeekendCard';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: weekends, isLoading, error } = useWeekends();

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-destructive">Error Loading Data</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProgressHeader weekends={weekends || []} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border border-border p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 flex-1 max-w-xs" />
                </div>
                <Skeleton className="h-4 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            weekends?.map((weekend) => (
              <WeekendCard key={weekend.id} weekend={weekend} />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
