import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  crmLeads,
  crmLead,
  createCrmLead,
  updateCrmLead,
  deleteCrmLead,
  moveCrmLeadStage,
  updateCrmLeadDates,
  addCrmLeadNote,
  deleteCrmLeadNote,
  addCrmLeadTask,
  deleteCrmLeadTask,
} from '../services';
import type { CrmLeadFilters } from '@hlb/contracts';

export const useCrmLeads = (filters?: CrmLeadFilters) =>
  useQuery({
    queryKey: ['crm-leads', filters],
    queryFn: () => crmLeads(filters),
  });

export const useCrmLead = (id?: string) =>
  useQuery({
    queryKey: ['crm-lead', id],
    queryFn: () => crmLead(id!),
    enabled: Boolean(id),
  });

export const useCrmLeadMutations = () => {
  const client = useQueryClient();

  const createLead = useMutation({
    mutationFn: createCrmLead,
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  const updateLead = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateCrmLead>[1] }) =>
      updateCrmLead(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  const deleteLead = useMutation({
    mutationFn: deleteCrmLead,
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  const moveStage = useMutation({
    mutationFn: ({ id, stageId, order }: { id: string; stageId: string; order?: number }) =>
      moveCrmLeadStage(id, stageId, order),
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  const updateDates = useMutation({
    mutationFn: ({ id, expectedCloseDate, dueDate }: { id: string; expectedCloseDate?: string | null; dueDate?: string | null }) =>
      updateCrmLeadDates(id, { expectedCloseDate, dueDate }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  const addNote = useMutation({
    mutationFn: ({ leadId, content }: { leadId: string; content: string }) =>
      addCrmLeadNote(leadId, content),
    onSuccess: (_, v) => client.invalidateQueries({ queryKey: ['crm-lead', v.leadId] }),
  });

  const deleteNote = useMutation({
    mutationFn: deleteCrmLeadNote,
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  const addTask = useMutation({
    mutationFn: ({ leadId, task }: { leadId: string; task: { title: string; description?: string; dueDate?: string; assignedTo?: string } }) =>
      addCrmLeadTask(leadId, task),
    onSuccess: (_, v) => client.invalidateQueries({ queryKey: ['crm-lead', v.leadId] }),
  });

  const deleteTask = useMutation({
    mutationFn: deleteCrmLeadTask,
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-leads'] }),
  });

  return {
    createLead: createLead.mutateAsync,
    updateLead: updateLead.mutateAsync,
    deleteLead: deleteLead.mutateAsync,
    moveStage: moveStage.mutateAsync,
    updateDates: updateDates.mutateAsync,
    addNote: addNote.mutateAsync,
    deleteNote: deleteNote.mutateAsync,
    addTask: addTask.mutateAsync,
    deleteTask: deleteTask.mutateAsync,
    isCreating: createLead.isPending,
    isUpdating: updateLead.isPending,
    isDeleting: deleteLead.isPending,
  };
};