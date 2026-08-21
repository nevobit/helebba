import { getModel } from '@hlb/constant-definitions';
import { type LeadId, type OrganizationId, type UserId } from '@hlb/contracts';

export const addCrmLeadNote = async (
  leadId: string,
  organizationId: string,
  userId: string,
  content: string
) => {
  const model = getModel('CRM_NOTES');

  const note = await model.create({
    organizationId,
    leadId,
    content,
    createdBy: userId,
    createdAt: new Date(),
  });

  return note;
};