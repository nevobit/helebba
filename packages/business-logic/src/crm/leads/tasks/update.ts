import { getModel } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';

export const updateCrmLeadTask = async (
  taskId: string,
  organizationId: string,
  data: Partial<{
    title: string;
    description?: string;
    dueDate?: Date;
    completed: boolean;
    assignedTo?: string;
  }>
) => {
  const model = getModel('CRM_TASKS');

  const task = await model.findOneAndUpdate(
    { _id: taskId, organizationId },
    { $set: { ...data, title: data.title?.trim() } },
    { new: true },
  );

  if (!task) throw new Error('Tarea no encontrada.');

  return task;
};