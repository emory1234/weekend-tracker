import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GripVertical, Trash2, Pencil, Check, X } from 'lucide-react';
import { Subtask, useUpdateSubtask, useDeleteSubtask } from '@/hooks/useWeekendsData';

interface SubtaskItemProps {
  subtask: Subtask;
  weekendId: number;
}

export function SubtaskItem({ subtask, weekendId }: SubtaskItemProps) {
  const updateSubtask = useUpdateSubtask();
  const deleteSubtask = useDeleteSubtask();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subtask.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleToggleComplete = () => {
    updateSubtask.mutate({
      id: subtask.id,
      weekend_id: weekendId,
      is_complete: !subtask.is_complete,
    });
  };

  const handleDelete = () => {
    deleteSubtask.mutate({ id: subtask.id, weekend_id: weekendId });
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== subtask.text) {
      updateSubtask.mutate({
        id: subtask.id,
        weekend_id: weekendId,
        text: editText.trim(),
      });
    } else {
      setEditText(subtask.text);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(subtask.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-sm p-1 -m-1 ${
        isDragging ? 'opacity-50 bg-accent' : ''
      }`}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      
      <Checkbox
        id={subtask.id}
        checked={subtask.is_complete}
        onCheckedChange={handleToggleComplete}
        disabled={isEditing}
      />
      
      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            ref={inputRef}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveEdit}
            className="h-8 w-8 p-0 text-primary hover:text-primary"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
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
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </li>
  );
}
