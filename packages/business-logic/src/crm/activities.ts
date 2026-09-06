import { Collection, getModel } from '@hlb/constant-definitions';
import {
  CrmOpportunityActivitySchemaMongo,
  CrmOpportunitySchemaMongo,
  LifecycleStatus,
  type CrmActivityId,
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

export const getCrmActivity = async (
  organizationId: OrganizationId,
  activityId: CrmActivityId,
) =>
  activities().findOne({
    _id: activityId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

type UpdateActivity = Partial<CreateActivity>;

export const updateCrmActivity = async (
  organizationId: OrganizationId,
  userId: UserId,
  activityId: CrmActivityId,
  input: UpdateActivity,
) => {
  const current = await getCrmActivity(organizationId, activityId);
  if (!current) throw new Error('La actividad no existe.');

  const title = input.title === undefined ? current.title : input.title.trim();
  if (!title) throw new Error('Ingresa el título de la actividad.');
  const startsAt = input.startsAt === undefined ? current.startsAt : new Date(input.startsAt);
  const endsAt = input.endsAt === undefined ? current.endsAt : new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()))
    throw new Error('Selecciona una fecha válida.');
  if (endsAt <= startsAt) throw new Error('La hora final debe ser posterior a la inicial.');

  let opportunityName = current.opportunityName;
  if (input.opportunityId !== undefined) {
    opportunityName = undefined;
    if (input.opportunityId) {
      const opportunity = await opportunities().findOne({
        _id: input.opportunityId,
        organizationId,
        lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      });
      if (!opportunity) throw new Error('La oportunidad seleccionada no existe.');
      opportunityName = opportunity.name;
    }
  }

  return activities().findOneAndUpdate(
    { _id: activityId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    {
      $set: {
        ...input,
        title,
        startsAt,
        endsAt,
        opportunityName,
        notes: input.notes === undefined ? current.notes : input.notes.trim() || undefined,
        updatedBy: userId,
      },
    },
    { new: true, runValidators: true },
  );
};

export const deleteCrmActivity = async (
  organizationId: OrganizationId,
  userId: UserId,
  activityId: CrmActivityId,
) => {
  const deleted = await activities().findOneAndUpdate(
    { _id: activityId, organizationId, lifecycleStatus: { $ne: LifecycleStatus.DELETED } },
    {
      $set: {
        lifecycleStatus: LifecycleStatus.DELETED,
        deletedAt: new Date(),
        deletedBy: userId,
        updatedBy: userId,
      },
    },
    { new: true },
  );
  if (!deleted) throw new Error('La actividad no existe o ya fue eliminada.');
  return deleted;
};
