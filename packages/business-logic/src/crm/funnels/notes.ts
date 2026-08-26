import { getModel, Collection } from '@hlb/constant-definitions';
import {
  CrmOpportunityNoteSchemaMongo,
  CrmOpportunitySchemaMongo,
  LifecycleStatus,
  type CrmOpportunity,
  type CrmOpportunityId,
  type CrmOpportunityNote,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const opportunities = () =>
  getModel<CrmOpportunity>(Collection.CRM_OPPORTUNITIES, CrmOpportunitySchemaMongo);
const notes = () =>
  getModel<CrmOpportunityNote>(Collection.CRM_OPPORTUNITY_NOTES, CrmOpportunityNoteSchemaMongo);

export const getCrmOpportunity = async (
  opportunityId: CrmOpportunityId,
  organizationId: OrganizationId,
) =>
  opportunities().findOne({
    _id: opportunityId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });

export const listCrmOpportunityNotes = async (
  opportunityId: CrmOpportunityId,
  organizationId: OrganizationId,
) =>
  notes()
    .find({
      opportunityId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    })
    .sort({ createdAt: -1 });

export const addCrmOpportunityNote = async (
  opportunityId: CrmOpportunityId,
  organizationId: OrganizationId,
  userId: UserId,
  content: string,
  color?: string,
  title?: string,
) => {
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Escribe el contenido de la nota.');
  const opportunity = await getCrmOpportunity(opportunityId, organizationId);
  if (!opportunity) throw new Error('Oportunidad no encontrada.');
  return notes().create({
    organizationId,
    opportunityId,
    title: title?.trim() || undefined,
    content: trimmed,
    color: color?.trim() || undefined,
    createdBy: userId,
    createdAt: new Date(),
  });
};

export const updateCrmOpportunityNote = async (
  noteId: string,
  organizationId: OrganizationId,
  patch: { content?: string; color?: string; title?: string },
) => {
  const note = await notes().findOne({
    _id: noteId,
    organizationId,
    lifecycleStatus: { $ne: LifecycleStatus.DELETED },
  });
  if (!note) throw new Error('Nota no encontrada.');
  if (patch.content !== undefined) {
    if (!patch.content.trim()) throw new Error('Escribe el contenido de la nota.');
    note.content = patch.content.trim();
  }
  if (patch.title !== undefined) note.title = patch.title.trim() || undefined;
  if (patch.color !== undefined) note.color = patch.color.trim() || undefined;
  return note.save();
};

export const deleteCrmOpportunityNote = async (
  noteId: string,
  organizationId: OrganizationId,
) => {
  const result = await notes().updateOne(
    {
      _id: noteId,
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
    },
    { $set: { lifecycleStatus: LifecycleStatus.DELETED, deletedAt: new Date() } },
  );
  if (!result.modifiedCount) throw new Error('Nota no encontrada.');
  return { success: true };
};
