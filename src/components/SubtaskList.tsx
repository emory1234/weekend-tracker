import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useSubtasks, useAddSubtask, useReorderSubtasks } from '@/hooks/useWeekendsData';
import { useAuth } from '@/contexts/AuthContext';
import { SubtaskItem } from './SubtaskItem';

interface SubtaskListProps {
  weekendId: number;
}

export function SubtaskList({ weekendId }: SubtaskListProps) {
  const { user } = useAuth();
  const { data: subtasks = [], isLoading } = useSubtasks(weekendId);
  const addSubtask = useAddSubtask();
  const reorderSubtasks = useReorderSubtasks();

  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSubtask = () => {
    if (!newTaskText.trim() || !user) return;

    addSubtask.mutate(
      { weekend_id: weekendId, text: newTaskText.trim(), user_id: user.id },
      {
        onSuccess: () => {
          setNewTaskText('');
          setIsAdding(false);
        },
      }
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subtasks.findIndex((s) => s.id === active.id);
      const newIndex = subtasks.findIndex((s) => s.id === over.id);
      
      const reordered = arrayMove(subtasks, oldIndex, newIndex);
      
      // Update sort_order for all affected items
      const updates = reordered.map((subtask, index) => ({
        id: subtask.id,
        sort_order: index,
      }));
      
      reorderSubtasks.mutate({ weekend_id: weekendId, subtasks: updates });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading subtasks...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Subtasks</h4>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter subtask..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            autoFocus
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddSubtask} disabled={!newTaskText.trim()}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setIsAdding(false); setNewTaskText(''); }}>
            Cancel
          </Button>
        </div>
      )}

      {subtasks.length === 0 && !isAdding ? (
        <p className="text-sm text-muted-foreground">No subtasks yet</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={subtasks.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {subtasks.map((subtask) => (
                <SubtaskItem key={subtask.id} subtask={subtask} weekendId={weekendId} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
