import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Weekend, useUpdateWeekend } from '@/hooks/useWeekendsData';
import { EditableText } from './EditableText';
import { SubtaskList } from './SubtaskList';
import { WeekendNotes } from './WeekendNotes';
import { WeekendTimer } from './WeekendTimer';
import { Separator } from '@/components/ui/separator';

interface WeekendCardProps {
  weekend: Weekend;
}

export function WeekendCard({ weekend }: WeekendCardProps) {
  const updateWeekend = useUpdateWeekend();

  const handleTitleSave = (title: string) => {
    updateWeekend.mutate({ id: weekend.id, title });
  };

  const handleDescriptionSave = (description: string) => {
    updateWeekend.mutate({ id: weekend.id, description: description || null });
  };

  const handleCompleteToggle = () => {
    updateWeekend.mutate({ id: weekend.id, is_complete: !weekend.is_complete });
  };

  return (
    <Card className={`transition-all ${weekend.is_complete ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-3 pt-1">
            <Checkbox
              id={`weekend-${weekend.id}`}
              checked={weekend.is_complete}
              onCheckedChange={handleCompleteToggle}
              className="h-5 w-5"
            />
            <span className="text-sm font-medium text-muted-foreground">#{weekend.id}</span>
          </div>
          <div className="flex-1 min-w-0">
            <EditableText
              value={weekend.title}
              onSave={handleTitleSave}
              placeholder="Weekend title..."
              className="text-xl font-semibold text-foreground"
            />
            <EditableText
              value={weekend.description || ''}
              onSave={handleDescriptionSave}
              placeholder="Add a description..."
              className="mt-1 text-sm text-muted-foreground"
            />
          </div>
          <WeekendTimer weekend={weekend} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <SubtaskList weekendId={weekend.id} />
        <Separator />
        <WeekendNotes weekend={weekend} />
      </CardContent>
    </Card>
  );
}
