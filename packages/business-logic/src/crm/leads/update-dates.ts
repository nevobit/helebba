import { getModel } from '@hlb/constant-definitions';
import { type LeadId, type OrganizationId, type UserId } from '@hlb/contracts';

const leads = () => getModel('CRM_LEADS', 'CrmLeadSchemaMongo');

export const updateCrmLeadDates = async (
  leadId: string,
  organizationId: string,
  userId: UserId,
  dates: {
    expectedCloseDate?: Date | null;
    dueDate?: Date | null;
  }
) => {
  const model = getModel('CRM_LEADS');

  const updateData: Record<string, Date | null | UserId> = {
    updatedBy: userId,
  };

  if (dates.expectedCloseDate !== undefined) {
    updateData.expectedCloseDate = dates.expectedCloseDate;
  }
  if (dates.dueDate !== undefined) {
    updateData.dueDate = dates.dueDate;
  }

  const updated = await model.findOneAndUpdate(
    { _id: leadId, organizationId, lifecycleStatus: { $ne: 'DELETED' } },
    { $set: updateData },
    { new: true },
  );

  if (!updated) throw new Error('Oportunidad no encontrada.');

  return updated;
};