import { getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, type LeadId, type CrmStageId, type OrganizationId, type UserId, type CrmFunnelId } from '@hlb/contracts';

const leads = () => getModel('CRM_LEADS', 'CrmLeadSchemaMongo');

export const moveCrmLeadStage = async (
  leadId: string,
  organizationId: OrganizationId,
  userId: UserId,
  stageId: string,
  funnelId?: string
) => {
  const lead = await getModel('CRM_LEADS').findOne({
    _id: leadId,
    organizationId,
    lifecycleStatus: { $ne: 'DELETED' },
  });

  if (!lead) throw new Error('Oportunidad no encontrada.');

  // If funnelId not provided, get it from lead
  const targetFunnelId = funnelId || lead.funnelId;

  // Verify stage exists in funnel
  const funnel = await getModel('CRM_FUNNELS').findOne({
    _id: targetFunnelId,
    organizationId: lead.organizationId,
    lifecycleStatus: { $ne: 'DELETED' },
  });

  if (!funnel) throw new Error('Embudo no encontrado.');

  const stageExists = funnel.stages.some((s: { id: string }) => s.id === stageId);
  if (!stageExists) throw new Error('La etapa seleccionada no existe en el embudo.');

  lead.stageId = stageId;
  lead.order = Date.now();
  lead.updatedBy = leadId;

  await lead.save();

  return lead;
};