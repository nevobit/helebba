import { getModel } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';

export const deleteCrmLeadTask = async (taskId: string, organizationId: string) => {
  const model = getModel('CRM_TASKS');

  const result = await model.deleteOne({ _id: taskId, organizationId });

  if (result.deletedCount === 0) throw new Error('Tarea no encontrada.');

  return { success: true };
};