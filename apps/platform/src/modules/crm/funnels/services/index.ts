import { api } from '@/shared/api';
import type {
  CrmFunnel,
  CrmOpportunity,
  CrmOpportunityActivity,
  CrmOpportunityNote,
  CrmStageId,
  UserId,
} from '@hlb/contracts';
export const crmFunnels = async () => (await api.get<CrmFunnel[]>('/crm/funnels')).data;
export const crmFunnel = async (id: string) =>
  (await api.get<CrmFunnel>(`/crm/funnels/${id}`)).data;
export const createCrmFunnel = async (payload: Partial<CrmFunnel>) =>
  (await api.post<CrmFunnel>('/crm/funnels', payload)).data;
export const setCrmFunnelMembers = async (funnelId: string, members: UserId[]) =>
  (await api.patch<CrmFunnel>(`/crm/funnels/${funnelId}/members`, { members })).data;
export const updateCrmFunnel = async (
  funnelId: string,
  payload: { name?: string; description?: string },
) => (await api.patch<CrmFunnel>(`/crm/funnels/${funnelId}`, payload)).data;
export const deleteCrmFunnel = async (funnelId: string) =>
  (await api.delete<{ success: boolean }>(`/crm/funnels/${funnelId}`)).data;
export const duplicateCrmFunnel = async (funnelId: string) =>
  (await api.post<CrmFunnel>(`/crm/funnels/${funnelId}/duplicate`)).data;
export const crmOpportunities = async (funnelId: string) =>
  (await api.get<CrmOpportunity[]>(`/crm/funnels/${funnelId}/opportunities`)).data;
export const crmDeal = async (dealId: string) =>
  (await api.get<CrmOpportunity>(`/crm/deals/${dealId}`)).data;
export const updateCrmDeal = async (dealId: string, payload: Partial<CrmOpportunity>) =>
  (await api.patch<CrmOpportunity>(`/crm/deals/${dealId}`, payload)).data;
export const deleteCrmDeal = async (dealId: string) =>
  (await api.delete<{ success: boolean }>(`/crm/deals/${dealId}`)).data;
export const crmDealNotes = async (dealId: string) =>
  (await api.get<CrmOpportunityNote[]>(`/crm/deals/${dealId}/notes`)).data;
export const createCrmDealNote = async (
  dealId: string,
  content: string,
  color?: string,
  title?: string,
) =>
  (await api.post<CrmOpportunityNote>(`/crm/deals/${dealId}/notes`, { content, color, title }))
    .data;
export const createCrmDealActivity = async (
  payload: Omit<
    CrmOpportunityActivity,
    | 'id'
    | 'organizationId'
    | 'createdBy'
    | 'updatedBy'
    | 'createdAt'
    | 'updatedAt'
    | 'lifecycleStatus'
    | 'deletedBy'
    | 'deletedAt'
  >,
) => (await api.post<CrmOpportunityActivity>('/crm/activities', payload)).data;
export const crmActivities = async (filters: { opportunityId?: string; search?: string } = {}) =>
  (await api.get<CrmOpportunityActivity[]>('/crm/activities', { params: filters })).data;
export const crmActivityOpportunities = async () =>
  (await api.get<CrmOpportunity[]>('/crm/activities/opportunities')).data;
export const updateCrmDealNote = async (
  dealId: string,
  noteId: string,
  payload: { content: string; color?: string; title?: string },
) => (await api.patch<CrmOpportunityNote>(`/crm/deals/${dealId}/notes/${noteId}`, payload)).data;
export const deleteCrmDealNote = async (dealId: string, noteId: string) =>
  (await api.delete<{ success: boolean }>(`/crm/deals/${dealId}/notes/${noteId}`)).data;
export const createCrmOpportunity = async (funnelId: string, payload: Partial<CrmOpportunity>) =>
  (await api.post<CrmOpportunity>(`/crm/funnels/${funnelId}/opportunities`, payload)).data;
export const moveCrmOpportunity = async (
  funnelId: string,
  opportunityId: string,
  stageId: CrmStageId,
) =>
  (
    await api.patch<CrmOpportunity>(
      `/crm/funnels/${funnelId}/opportunities/${opportunityId}/stage`,
      { stageId },
    )
  ).data;
export const setCrmOpportunityStatus = async (
  funnelId: string,
  opportunityId: string,
  status: 'open' | 'won' | 'lost',
) =>
  (
    await api.patch<CrmOpportunity>(
      `/crm/funnels/${funnelId}/opportunities/${opportunityId}/status`,
      { status },
    )
  ).data;
