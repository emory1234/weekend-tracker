import { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Weekend, useUpdateWeekend } from '@/hooks/useWeekendsData';

interface WeekendNotesProps {
  weekend: Weekend;
}

export function WeekendNotes({ weekend }: WeekendNotesProps) {
  const updateWeekend = useUpdateWeekend();
  const [notes, setNotes] = useState(weekend.notes || '');

  useEffect(() => {
    setNotes(weekend.notes || '');
  }, [weekend.notes]);

  // Debounced save
  const debouncedSave = useCallback(
    (value: string) => {
      const timeoutId = setTimeout(() => {
        if (value !== weekend.notes) {
          updateWeekend.mutate({ id: weekend.id, notes: value || null });
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    },
    [weekend.id, weekend.notes, updateWeekend]
  );

  const handleChange = (value: string) => {
    setNotes(value);
    debouncedSave(value);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-foreground">Notes</h4>
      <Textarea
        placeholder="Document your learnings, highlights, and thoughts..."
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[100px] resize-y"
      />
    </div>
  );
}
