import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { useSubtasks, useAddSubtask, useUpdateSubtask, useDeleteSubtask, Subtask } from '@/hooks/useWeekendsData';

interface SubtaskListProps {
  weekendId: number;
}

export function SubtaskList({ weekendId }: SubtaskListProps) {
  const { data: subtasks = [], isLoading } = useSubtasks(weekendId);
  const addSubtask = useAddSubtask();
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();
  
  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSubtask = () => {
    if (!newTaskText.trim()) return;
    
    addSubtask.mutate(
      { weekend_id: weekendId, text: newTaskText.trim() },
      {
        onSuccess: () => {
          setNewTaskText('');
          setIsAdding(false);
        },
      }
    );
  };

  const handleToggleComplete = (subtask: Subtask) => {
    updateSubtask.mutate({
      id: subtask.id,
      weekend_id: weekendId,
      is_complete: !subtask.is_complete,
    });
  };

  const handleDelete = (subtask: Subtask) => {
    deleteSubtask.mutate({ id: subtask.id, weekend_id: weekendId });
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
        <ul className="space-y-2">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="group flex items-center gap-3">
              <Checkbox
                id={subtask.id}
                checked={subtask.is_complete}
                onCheckedChange={() => handleToggleComplete(subtask)}
              />
              <label
                htmlFor={subtask.id}
                className={`flex-1 text-sm cursor-pointer ${
                  subtask.is_complete ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}
              >
                {subtask.text}
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(subtask)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
