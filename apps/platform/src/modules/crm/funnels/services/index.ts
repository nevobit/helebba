import { api } from '@/shared/api';
import type { CrmFunnel, CrmOpportunity, CrmStageId } from '@hlb/contracts';
export const crmFunnels = async () => (await api.get<CrmFunnel[]>('/crm/funnels')).data;
export const crmFunnel = async (id: string) =>
  (await api.get<CrmFunnel>(`/crm/funnels/${id}`)).data;
export const createCrmFunnel = async (payload: Partial<CrmFunnel>) =>
  (await api.post<CrmFunnel>('/crm/funnels', payload)).data;
export const crmOpportunities = async (funnelId: string) =>
  (await api.get<CrmOpportunity[]>(`/crm/funnels/${funnelId}/opportunities`)).data;
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
