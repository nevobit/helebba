import { getModel } from '@hlb/constant-definitions';
import { type LeadId, type OrganizationId, type UserId } from '@hlb/contracts';

export const updateCrmLeadNote = async (
  noteId: string,
  organizationId: string,
  userId: string,
  content: string
) => {
  const model = getModel('CRM_NOTES');

  const note = await model.findOneAndUpdate(
    { _id: noteId, organizationId },
    { $set: { content, updatedBy: userId } },
    { new: true },
  );

  if (!note) throw new Error('Nota no encontrada.');

  return note;
};