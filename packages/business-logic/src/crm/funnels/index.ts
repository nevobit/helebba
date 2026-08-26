import { randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CrmFunnelSchemaMongo,
  CrmOpportunitySchemaMongo,
  LifecycleStatus,
  type CrmFunnel,
  type CrmFunnelId,
  type CrmOpportunity,
  type CrmOpportunityId,
  type CrmStage,
  type CrmStageId,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const funnels = () => getModel<CrmFunnel>(Collection.CRM_FUNNELS, CrmFunnelSchemaMongo);
const opportunities = () =>
  getModel<CrmOpportunity>(Collection.CRM_OPPORTUNITIES, CrmOpportunitySchemaMongo);
const stageMatches = (stage: CrmStage & { _id?: unknown }, id: unknown) =>
  [stage.id, stage._id].some((value) => value != null && String(value) === String(id));
export const defaultCrmStages = () =>
  [
    { id: randomUUID() as CrmStageId, name: 'Nuevo', color: '#6172F3', order: 0, probability: 10 },
    {
      id: randomUUID() as CrmStageId,
      name: 'Contactado',
      color: '#2E90FA',
      order: 1,
      probability: 25,
    },
    {
      id: randomUUID() as CrmStageId,
      name: 'Propuesta',
      color: '#F79009',
      order: 2,
      probability: 50,
    },
    {
      id: randomUUID() as CrmStageId,
      name: 'Negociación',
      color: '#9E77ED',
      order: 3,
      probability: 75,
    },
    {
      id: randomUUID() as CrmStageId,
      name: 'Ganado',
      color: '#12B76A',
      order: 4,
      probability: 100,
    },
  ] as CrmStage[];
export const seedDefaultCrmFunnel = async ({
  organizationId,
  userId,
}: {
  organizationId: OrganizationId;
  userId: UserId;
}) => {
  const existing = await funnels().findOne({
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (existing) return existing;
  return funnels().create({
    organizationId,
    createdBy: userId,
    updatedBy: userId,
    name: 'Embudo de ventas',
    description: 'Embudo de ventas predeterminado',
    isDefault: true,
    stages: defaultCrmStages(),
  });
};
export const listCrmFunnels = async (organizationId: OrganizationId, userId: UserId) => {
  await seedDefaultCrmFunnel({ organizationId, userId });
  return funnels()
    .find({ organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } })
    .sort({ isDefault: -1, createdAt: 1 });
};
export const getCrmFunnel = async (funnelId: CrmFunnelId, organizationId: OrganizationId) =>
  funnels().findOne({
    _id: funnelId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
export const createCrmFunnel = async (
  data: Partial<CrmFunnel> & {
    organizationId: OrganizationId;
    createdBy: UserId;
    updatedBy: UserId;
  },
) => {
  if (!data.name?.trim()) throw new Error('Ingresa el nombre del embudo.');
  const stages = (data.stages?.length ? data.stages : defaultCrmStages()).map((stage, index) => ({
    ...stage,
    id: stage.id ?? randomUUID(),
    name: stage.name.trim(),
    order: index,
    probability: Number(stage.probability ?? 0),
    color: stage.color || '#6172F3',
  }));
  if (stages.some((stage) => !stage.name))
    throw new Error('Todas las etapas deben tener un nombre.');
  return funnels().create({
    ...data,
    name: data.name.trim(),
    description: data.description?.trim() ?? '',
    isDefault: false,
    members: data.members?.length ? data.members : [data.createdBy],
    stages,
  });
};
export const setCrmFunnelMembers = async (
  funnelId: CrmFunnelId,
  organizationId: OrganizationId,
  userId: UserId,
  members: UserId[],
) => {
  if (!Array.isArray(members) || members.some((member) => !member))
    throw new Error('Lista de usuarios inválida.');
  const funnel = await funnels().findOne({
    _id: funnelId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!funnel) throw new Error('Embudo no encontrado.');
  funnel.members = [...new Set(members)];
  funnel.set('updatedBy', userId);
  return funnel.save();
};
export const updateCrmFunnel = async (
  funnelId: CrmFunnelId,
  organizationId: OrganizationId,
  userId: UserId,
  patch: { name?: string; description?: string },
) => {
  if (patch.name !== undefined && !patch.name.trim())
    throw new Error('Ingresa el nombre del embudo.');
  const funnel = await funnels().findOne({
    _id: funnelId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!funnel) throw new Error('Embudo no encontrado.');
  if (patch.name !== undefined) funnel.name = patch.name.trim();
  if (patch.description !== undefined) funnel.description = patch.description;
  funnel.set('updatedBy', userId);
  return funnel.save();
};
export const deleteCrmFunnel = async (
  funnelId: CrmFunnelId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const funnel = await funnels().findOne({
    _id: funnelId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!funnel) throw new Error('Embudo no encontrado.');
  if (funnel.isDefault) throw new Error('No puedes eliminar el embudo predeterminado.');
  funnel.lifecycleStatus = LifecycleStatus.DELETED;
  funnel.deletedAt = new Date();
  funnel.set('deletedBy', userId);
  await funnel.save();
  return { success: true };
};
export const duplicateCrmFunnel = async (
  funnelId: CrmFunnelId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const source = await funnels().findOne({
    _id: funnelId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!source) throw new Error('Embudo no encontrado.');
  return funnels().create({
    organizationId,
    createdBy: userId,
    updatedBy: userId,
    name: `${source.name} (copia)`,
    description: source.description,
    isDefault: false,
    members: source.members ?? [userId],
    stages: source.stages.map((stage) => ({ ...stage, id: randomUUID() as CrmStageId })),
  });
};
export const listCrmOpportunities = async (funnelId: CrmFunnelId, organizationId: OrganizationId) =>
  opportunities()
    .find({
      funnelId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      status: 'open',
    })
    .sort({ order: 1, createdAt: -1 });
export const createCrmOpportunity = async (
  data: Partial<CrmOpportunity> & {
    organizationId: OrganizationId;
    createdBy: UserId;
    updatedBy: UserId;
    funnelId: CrmFunnelId;
  },
) => {
  if (!data.name?.trim()) throw new Error('Ingresa el nombre de la oportunidad.');
  const funnel = await getCrmFunnel(data.funnelId, data.organizationId);
  if (!funnel) throw new Error('Embudo no encontrado.');
  const stageId =
    data.stageId ??
    (funnel.stages[0] as CrmStage & { _id?: CrmStageId })._id ??
    funnel.stages[0]?.id;
  if (
    !stageId ||
    !funnel.stages.some((stage) => stageMatches(stage as CrmStage & { _id?: unknown }, stageId))
  )
    throw new Error('La etapa seleccionada no existe.');
  return opportunities().create({
    ...data,
    name: data.name.trim(),
    contactName: data.contactName?.trim() ?? '',
    stageId,
    value: Number(data.value ?? 0),
    currency: data.currency || 'COP',
    notes: data.notes?.trim() ?? '',
    status: 'open',
    order: Date.now(),
  });
};
export const moveCrmOpportunity = async (
  opportunityId: CrmOpportunityId,
  organizationId: OrganizationId,
  userId: UserId,
  stageId: CrmStageId,
) => {
  const opportunity = await opportunities().findOne({
    _id: opportunityId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!opportunity) throw new Error('Oportunidad no encontrada.');
  const funnel = await getCrmFunnel(opportunity.funnelId, organizationId);
  if (!funnel?.stages.some((stage) => stageMatches(stage as CrmStage & { _id?: unknown }, stageId)))
    throw new Error('La etapa seleccionada no existe.');
  opportunity.stageId = stageId;
  opportunity.order = Date.now();
  opportunity.set('updatedBy', userId);
  return opportunity.save();
};
export const setCrmOpportunityStatus = async (
  opportunityId: CrmOpportunityId,
  organizationId: OrganizationId,
  userId: UserId,
  status: CrmOpportunity['status'],
) => {
  const opportunity = await opportunities().findOne({
    _id: opportunityId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!opportunity) throw new Error('Oportunidad no encontrada.');
  opportunity.status = status;
  opportunity.set('updatedBy', userId);
  return opportunity.save();
};
export const updateCrmOpportunity = async (
  opportunityId: CrmOpportunityId,
  organizationId: OrganizationId,
  userId: UserId,
  patch: Partial<CrmOpportunity>,
) => {
  const opportunity = await opportunities().findOne({
    _id: opportunityId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!opportunity) throw new Error('Oportunidad no encontrada.');
  if (patch.stageId !== undefined) {
    const funnel = await getCrmFunnel(opportunity.funnelId, organizationId);
    if (
      !funnel?.stages.some((stage) =>
        stageMatches(stage as CrmStage & { _id?: unknown }, patch.stageId as CrmStageId),
      )
    )
      throw new Error('La etapa seleccionada no existe.');
    opportunity.stageId = patch.stageId;
  }
  if (patch.name !== undefined) {
    if (!patch.name.trim()) throw new Error('Ingresa el nombre de la oportunidad.');
    opportunity.name = patch.name.trim();
  }
  if (patch.value !== undefined) opportunity.value = Number(patch.value);
  if (patch.currency !== undefined) opportunity.currency = patch.currency;
  if (patch.contactId !== undefined) opportunity.contactId = patch.contactId;
  if (patch.contactName !== undefined) opportunity.contactName = patch.contactName;
  if (patch.companyId !== undefined) opportunity.companyId = patch.companyId;
  if (patch.companyName !== undefined) opportunity.companyName = patch.companyName;
  if (patch.expectedCloseDate !== undefined)
    opportunity.expectedCloseDate = patch.expectedCloseDate;
  if (patch.assignedToName !== undefined) opportunity.assignedToName = patch.assignedToName;
  if (patch.tags !== undefined) opportunity.tags = patch.tags;
  if (patch.probability !== undefined) opportunity.probability = patch.probability;
  if (patch.relatedDocumentType !== undefined)
    opportunity.relatedDocumentType = patch.relatedDocumentType;
  if (patch.relatedDocumentId !== undefined)
    opportunity.relatedDocumentId = patch.relatedDocumentId;
  opportunity.set('updatedBy', userId);
  return opportunity.save();
};
export const deleteCrmOpportunity = async (
  opportunityId: CrmOpportunityId,
  organizationId: OrganizationId,
  userId: UserId,
) => {
  const opportunity = await opportunities().findOne({
    _id: opportunityId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!opportunity) throw new Error('Oportunidad no encontrada.');
  opportunity.lifecycleStatus = LifecycleStatus.DELETED;
  opportunity.deletedAt = new Date();
  opportunity.set('deletedBy', userId);
  return opportunity.save();
};
