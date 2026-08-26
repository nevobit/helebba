import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrmOpportunity } from '@hlb/contracts';
import {
  createCrmDealActivity,
  createCrmFunnel,
  createCrmOpportunity,
  createCrmDealNote,
  crmFunnel,
  crmFunnels,
  crmOpportunities,
  crmDeal,
  crmDealNotes,
  crmActivities,
  crmActivityOpportunities,
  deleteCrmDeal,
  deleteCrmFunnel,
  duplicateCrmFunnel,
  moveCrmOpportunity,
  setCrmFunnelMembers,
  setCrmOpportunityStatus,
  updateCrmFunnel,
  deleteCrmDealNote,
  updateCrmDeal,
  updateCrmDealNote,
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
export const useCrmDeal = (dealId?: string) =>
  useQuery({
    queryKey: ['crm-deal', dealId],
    queryFn: () => crmDeal(dealId!),
    enabled: Boolean(dealId),
  });
export const useCrmDealNotes = (dealId?: string) =>
  useQuery({
    queryKey: ['crm-deal-notes', dealId],
    queryFn: () => crmDealNotes(dealId!),
    enabled: Boolean(dealId),
  });
export const useCrmActivities = (opportunityId?: string) =>
  useQuery({
    queryKey: ['crm-activities', opportunityId],
    queryFn: () => crmActivities({ opportunityId }),
  });
export const useCrmActivityOpportunities = () =>
  useQuery({ queryKey: ['crm-activity-opportunities'], queryFn: crmActivityOpportunities });
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
    onMutate: async (variables) => {
      const opportunitiesKey = ['crm-opportunities', variables.funnelId] as const;
      const dealKey = ['crm-deal', variables.opportunityId] as const;

      await Promise.all([
        client.cancelQueries({ queryKey: opportunitiesKey }),
        client.cancelQueries({ queryKey: dealKey }),
      ]);

      const previousOpportunities = client.getQueryData<CrmOpportunity[]>(opportunitiesKey);
      const previousDeal = client.getQueryData<CrmOpportunity>(dealKey);

      client.setQueryData<CrmOpportunity[]>(opportunitiesKey, (current = []) =>
        current.map((opportunity) =>
          String(opportunity.id) === variables.opportunityId
            ? { ...opportunity, stageId: variables.stageId }
            : opportunity,
        ),
      );
      client.setQueryData<CrmOpportunity>(dealKey, (current) =>
        current ? { ...current, stageId: variables.stageId } : current,
      );

      return { dealKey, opportunitiesKey, previousDeal, previousOpportunities };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      client.setQueryData(context.opportunitiesKey, context.previousOpportunities);
      client.setQueryData(context.dealKey, context.previousDeal);
    },
    onSuccess: (updatedOpportunity, variables) => {
      client.setQueryData<CrmOpportunity[]>(
        ['crm-opportunities', variables.funnelId],
        (current = []) =>
          current.map((opportunity) =>
            String(opportunity.id) === variables.opportunityId ? updatedOpportunity : opportunity,
          ),
      );
      client.setQueryData(['crm-deal', variables.opportunityId], updatedOpportunity);
    },
  });
  const updateOpportunityStatus = useMutation({
    mutationFn: ({
      funnelId,
      opportunityId,
      status,
    }: {
      funnelId: string;
      opportunityId: string;
      status: Parameters<typeof setCrmOpportunityStatus>[2];
    }) => setCrmOpportunityStatus(funnelId, opportunityId, status),
    onSuccess: (_, v) => {
      client.invalidateQueries({ queryKey: ['crm-opportunities', v.funnelId] });
      client.invalidateQueries({ queryKey: ['crm-deal', v.opportunityId] });
    },
  });
  const addOpportunityNote = useMutation({
    mutationFn: ({
      dealId,
      content,
      color,
      title,
    }: {
      dealId: string;
      content: string;
      color?: string;
      title?: string;
    }) => createCrmDealNote(dealId, content, color, title),
    onSuccess: (_, v) => client.invalidateQueries({ queryKey: ['crm-deal-notes', v.dealId] }),
  });
  const addOpportunityActivity = useMutation({
    mutationFn: ({ payload }: { payload: Parameters<typeof createCrmDealActivity>[0] }) =>
      createCrmDealActivity(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-activities'] }),
  });
  const updateFunnelMembers = useMutation({
    mutationFn: ({ funnelId, members }: { funnelId: string; members: string[] }) =>
      setCrmFunnelMembers(funnelId, members as never),
    onSuccess: (_, v) => {
      client.invalidateQueries({ queryKey: ['crm-funnels'] });
      client.invalidateQueries({ queryKey: ['crm-funnel', v.funnelId] });
    },
  });
  const editOpportunityNote = useMutation({
    mutationFn: ({
      dealId,
      noteId,
      content,
      color,
      title,
    }: {
      dealId: string;
      noteId: string;
      content: string;
      color?: string;
      title?: string;
    }) => updateCrmDealNote(dealId, noteId, { content, color, title }),
    onSuccess: (_, v) => client.invalidateQueries({ queryKey: ['crm-deal-notes', v.dealId] }),
  });
  const updateOpportunity = useMutation({
    mutationFn: ({ dealId, payload }: { dealId: string; payload: Partial<CrmOpportunity> }) =>
      updateCrmDeal(dealId, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['crm-opportunities'] });
      client.invalidateQueries({ queryKey: ['crm-deal'] });
    },
  });
  const deleteOpportunity = useMutation({
    mutationFn: ({ dealId }: { dealId: string }) => deleteCrmDeal(dealId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['crm-opportunities'] });
      client.invalidateQueries({ queryKey: ['crm-deal'] });
    },
  });
  const deleteOpportunityNote = useMutation({
    mutationFn: ({ dealId, noteId }: { dealId: string; noteId: string }) =>
      deleteCrmDealNote(dealId, noteId),
    onSuccess: (_, v) => client.invalidateQueries({ queryKey: ['crm-deal-notes', v.dealId] }),
  });
  const renameFunnel = useMutation({
    mutationFn: ({
      funnelId,
      name,
      description,
    }: {
      funnelId: string;
      name?: string;
      description?: string;
    }) => updateCrmFunnel(funnelId, { name, description }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-funnels'] }),
  });
  const removeFunnel = useMutation({
    mutationFn: ({ funnelId }: { funnelId: string }) => deleteCrmFunnel(funnelId),
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-funnels'] }),
  });
  const duplicateFunnel = useMutation({
    mutationFn: ({ funnelId }: { funnelId: string }) => duplicateCrmFunnel(funnelId),
    onSuccess: () => client.invalidateQueries({ queryKey: ['crm-funnels'] }),
  });
  return {
    createFunnel: createFunnel.mutateAsync,
    createOpportunity: createOpportunity.mutate,
    moveOpportunity: moveOpportunity.mutate,
    updateOpportunityStatus: updateOpportunityStatus.mutate,
    addOpportunityNote: addOpportunityNote.mutateAsync,
    addOpportunityActivity: addOpportunityActivity.mutateAsync,
    editOpportunityNote: editOpportunityNote.mutateAsync,
    deleteOpportunityNote: deleteOpportunityNote.mutateAsync,
    updateFunnelMembers: updateFunnelMembers.mutateAsync,
    renameFunnel: renameFunnel.mutateAsync,
    removeFunnel: removeFunnel.mutateAsync,
    duplicateFunnel: duplicateFunnel.mutateAsync,
    updateOpportunity: updateOpportunity.mutateAsync,
    deleteOpportunity: deleteOpportunity.mutateAsync,
    isCreatingFunnel: createFunnel.isPending,
    isCreatingOpportunity: createOpportunity.isPending,
    isUpdatingOpportunityStatus: updateOpportunityStatus.isPending,
    isAddingOpportunityNote: addOpportunityNote.isPending,
    isAddingOpportunityActivity: addOpportunityActivity.isPending,
    isEditingOpportunityNote: editOpportunityNote.isPending,
    isDeletingOpportunityNote: deleteOpportunityNote.isPending,
    isUpdatingFunnelMembers: updateFunnelMembers.isPending,
    isRenamingFunnel: renameFunnel.isPending,
    isRemovingFunnel: removeFunnel.isPending,
    isDuplicatingFunnel: duplicateFunnel.isPending,
    isUpdatingOpportunity: updateOpportunity.isPending,
    isDeletingOpportunity: deleteOpportunity.isPending,
  };
};
