import { api } from '@/shared/api';
import type { CrmLead, CrmLeadFilters, CrmCustomField } from '@hlb/contracts';

export type CreateCrmLeadPayload = {
  name: string;
  funnelId: string;
  stageId?: string;
  contactId: string;
  contactName: string;
  companyId?: string;
  companyName?: string;
  value?: number;
  currency?: string;
  expectedCloseDate?: string;
  dueDate?: string;
  potential?: number;
  notes?: string;
  assignedToName?: string;
  assignedTo?: string;
  tags?: string[];
  probability?: number;
  relatedDocumentType?: string;
  relatedDocumentId?: string;
  customFields?: CrmCustomField[];
  stagnationDays?: number;
};

export type UpdateCrmLeadPayload = Partial<CreateCrmLeadPayload> & {
  status?: 'open' | 'won' | 'lost';
  order?: number;
};

export const crmLeads = async (filters?: CrmLeadFilters) => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });
  }
  const { data } = await api.get<{
    data: CrmLead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(`/crm/leads?${params.toString()}`);
  console.log(data);
  return data;
};

export const crmLead = async (id: string) => (await api.get<CrmLead>(`/crm/leads/${id}`)).data;

export const createCrmLead = async (payload: CreateCrmLeadPayload) =>
  (await api.post<CrmLead>('/crm/leads', payload)).data;

export const updateCrmLead = async (id: string, payload: UpdateCrmLeadPayload) =>
  (await api.patch<CrmLead>(`/crm/leads/${id}`, payload)).data;

export const deleteCrmLead = async (id: string) => (await api.delete(`/crm/leads/${id}`)).data;

export const moveCrmLeadStage = async (id: string, stageId: string, order?: number) =>
  (await api.patch<CrmLead>(`/crm/leads/${id}/stage`, { stageId, order })).data;

export const updateCrmLeadDates = async (
  id: string,
  dates: {
    expectedCloseDate?: string | null;
    dueDate?: string | null;
  },
) => (await api.patch<CrmLead>(`/crm/leads/${id}/dates`, dates)).data;

export const addCrmLeadNote = async (id: string, content: string) =>
  (
    await api.post<{
      id: string;
      leadId: string;
      content: string;
      createdBy: string;
      createdAt: string;
    }>(`/crm/leads/${id}/notes`, { content })
  ).data;

export const updateCrmLeadNote = async (noteId: string, content: string) =>
  (await api.patch<{ id: string; content: string }>(`/crm/leads/notes/${noteId}`, { content }))
    .data;

export const deleteCrmLeadNote = async (noteId: string) =>
  (await api.delete(`/crm/leads/notes/${noteId}`)).data;

export const addCrmLeadTask = async (
  leadId: string,
  task: {
    title: string;
    description?: string;
    dueDate?: string;
    assignedTo?: string;
  },
) =>
  (
    await api.post<{
      id: string;
      leadId: string;
      title: string;
      description?: string;
      dueDate?: string;
      completed: boolean;
      assignedTo?: string;
      createdBy: string;
      createdAt: string;
    }>(`/crm/leads/${leadId}/tasks`, task)
  ).data;

export const updateCrmLeadTask = async (
  taskId: string,
  task: {
    title?: string;
    description?: string;
    dueDate?: string;
    completed?: boolean;
    assignedTo?: string;
  },
) =>
  (
    await api.patch<{ id: string; title: string; completed: boolean }>(
      `/crm/leads/tasks/${taskId}`,
      task,
    )
  ).data;

export const deleteCrmLeadTask = async (taskId: string) =>
  (await api.delete(`/crm/leads/tasks/${taskId}`)).data;
