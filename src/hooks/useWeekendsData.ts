import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Weekend {
  id: number;
  title: string;
  description: string | null;
  is_complete: boolean;
  notes: string | null;
  total_time_seconds: number;
  timer_started_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  weekend_id: number;
  text: string;
  is_complete: boolean;
  sort_order: number;
  created_at: string;
}

export function useWeekends() {
  return useQuery({
    queryKey: ['weekends'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekends')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data as Weekend[];
    },
  });
}

export function useSubtasks(weekendId: number) {
  return useQuery({
    queryKey: ['subtasks', weekendId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('weekend_id', weekendId)
        .order('sort_order');
      
      if (error) throw error;
      return data as Subtask[];
    },
  });
}

export function useUpdateWeekend() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Weekend> & { id: number }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase
        .from('weekends')
        .update(rest)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekends'] });
    },
  });
}

export function useAddSubtask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ weekend_id, text }: { weekend_id: number; text: string }) => {
      const { data: existing } = await supabase
        .from('subtasks')
        .select('sort_order')
        .eq('weekend_id', weekend_id)
        .order('sort_order', { ascending: false })
        .limit(1);
      
      const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
      
      const { error } = await supabase
        .from('subtasks')
        .insert({ weekend_id, text, sort_order: nextOrder });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', variables.weekend_id] });
    },
  });
}

export function useUpdateSubtask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, weekend_id, ...updates }: Partial<Subtask> & { id: string; weekend_id: number }) => {
      const { error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return weekend_id;
    },
    onSuccess: (weekendId) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', weekendId] });
    },
  });
}

export function useReorderSubtasks() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ weekend_id, subtasks }: { weekend_id: number; subtasks: { id: string; sort_order: number }[] }) => {
      // Update all subtasks with their new sort order
      const updates = subtasks.map(({ id, sort_order }) =>
        supabase.from('subtasks').update({ sort_order }).eq('id', id)
      );
      
      await Promise.all(updates);
      return weekend_id;
    },
    onSuccess: (weekendId) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', weekendId] });
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, weekend_id }: { id: string; weekend_id: number }) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return weekend_id;
    },
    onSuccess: (weekendId) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', weekendId] });
    },
  });
}
