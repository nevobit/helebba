import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CrmOpportunityActivitySchemaMongo,
  CrmOpportunitySchemaMongo,
  LifecycleStatus,
  type CrmOpportunity,
  type CrmOpportunityActivity,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const activities = () =>
  getModel<CrmOpportunityActivity>(Collection.CRM_ACTIVITIES, CrmOpportunityActivitySchemaMongo);
const opportunities = () =>
  getModel<CrmOpportunity>(Collection.CRM_OPPORTUNITIES, CrmOpportunitySchemaMongo);

export type CrmActivityFilters = {
  opportunityId?: string;
  completed?: boolean;
  search?: string;
  from?: Date;
  to?: Date;
};

export const listCrmActivities = async (
  organizationId: OrganizationId,
  filters: CrmActivityFilters = {},
) => {
  const query: Record<string, unknown> = {
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  };
  if (filters.opportunityId) query.opportunityId = filters.opportunityId;
  if (filters.completed !== undefined) query.completed = filters.completed;
  if (filters.search) query.title = { $regex: filters.search, $options: 'i' };
  if (filters.from || filters.to)
    query.startsAt = {
      ...(filters.from ? { $gte: filters.from } : {}),
      ...(filters.to ? { $lte: filters.to } : {}),
    };
  return activities().find(query).sort({ startsAt: 1 });
};

export const listCrmActivityOpportunities = async (organizationId: OrganizationId) =>
  opportunities()
    .find({ organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED }, status: 'open' })
    .select({ name: 1, funnelId: 1, stageId: 1 })
    .sort({ name: 1 });

type CreateActivity = Omit<
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
>;

export const createCrmActivity = async (
  organizationId: OrganizationId,
  userId: UserId,
  input: CreateActivity,
) => {
  if (!input.title?.trim()) throw new Error('Ingresa el título de la actividad.');
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()))
    throw new Error('Selecciona una fecha válida.');
  if (endsAt <= startsAt) throw new Error('La hora final debe ser posterior a la inicial.');
  let opportunityName: string | undefined;
  if (input.opportunityId) {
    const opportunity = await opportunities().findOne({
      _id: input.opportunityId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    });
    if (!opportunity) throw new Error('La oportunidad seleccionada no existe.');
    opportunityName = opportunity.name;
  }
  return activities().create({
    ...input,
    organizationId,
    title: input.title.trim(),
    opportunityName,
    notes: input.notes?.trim() || undefined,
    startsAt,
    endsAt,
    createdBy: userId,
    updatedBy: userId,
  });
};
