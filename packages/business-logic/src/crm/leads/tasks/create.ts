import { getModel } from '@hlb/constant-definitions';
import { type LeadId, type OrganizationId, type UserId } from '@hlb/contracts';

export const addCrmLeadTask = async (
  leadId: string,
  organizationId: string,
  userId: UserId,
  data: {
    title: string;
    description?: string;
    dueDate?: Date;
    assignedTo?: string;
  }
) => {
  const model = getModel('CRM_TASKS');

  const task = await model.create({
    organizationId,
    leadId,
    title: data.title.trim(),
    description: data.description?.trim(),
    dueDate: data.dueDate,
    completed: false,
    assignedTo: data.assignedTo,
    createdBy: userId,
    createdAt: new Date(),
  });

  return task;
};