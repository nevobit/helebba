import { getModel } from '@hlb/constant-definitions';
import { type LeadId, type OrganizationId } from '@hlb/contracts';

export const deleteCrmLeadNote = async (noteId: string, organizationId: string) => {
  const model = getModel('CRM_NOTES');

  const result = await model.deleteOne({ _id: noteId, organizationId });

  if (result.deletedCount === 0) throw new Error('Nota no encontrada.');

  return { success: true };
};