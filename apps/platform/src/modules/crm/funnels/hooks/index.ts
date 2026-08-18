import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCrmFunnel,
  createCrmOpportunity,
  crmFunnel,
  crmFunnels,
  crmOpportunities,
  moveCrmOpportunity,
} from '../services';
export const useCrmFunnels = () => useQuery({ queryKey: ['crm-funnels'], queryFn: crmFunnels });
export const useCrmFunnel = (id?: string) =>
  useQuery({ queryKey: ['crm-funnel', id], queryFn: () => crmFunnel(id!), enabled: Boolean(id) });
export const useCrmOpportunities = (id?: string) =>
  useQuery({
    queryKey: ['crm-opportunities', id],
    queryFn: () => crmOpportunities(id!),
    enabled: Boolean(id),
  });
export const useCrmMutations = () => {
  const client = useQueryClient();
  const createFunnel = useMutation({
    mutationFn: createCrmFunnel,
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-funnels'] }),
  });
  const createOpportunity = useMutation({
    mutationFn: ({
      funnelId,
      payload,
    }: {
      funnelId: string;
      payload: Parameters<typeof createCrmOpportunity>[1];
    }) => createCrmOpportunity(funnelId, payload),
    onSuccess: (_, v) => client.invalidateQueries({ queryKey: ['crm-opportunities', v.funnelId] }),
  });
  const moveOpportunity = useMutation({
    mutationFn: ({
      funnelId,
      opportunityId,
      stageId,
    }: {
      funnelId: string;
      opportunityId: string;
      stageId: Parameters<typeof moveCrmOpportunity>[2];
    }) => moveCrmOpportunity(funnelId, opportunityId, stageId),
    onSuccess: (_, v) => client.invalidateQueries({ queryKey: ['crm-opportunities', v.funnelId] }),
  });
  return {
    createFunnel: createFunnel.mutateAsync,
    createOpportunity: createOpportunity.mutate,
    moveOpportunity: moveOpportunity.mutate,
    isCreatingFunnel: createFunnel.isPending,
    isCreatingOpportunity: createOpportunity.isPending,
  };
};
