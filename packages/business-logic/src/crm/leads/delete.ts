import { getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, type LeadId, type OrganizationId, type UserId } from '@hlb/contracts';

export const deleteCrmLead = async (leadId: string, organizationId: string, userId: string) => {
  const model = getModel('CRM_LEADS');

  const result = await model.updateOne(
    { _id: leadId, organizationId },
    {
      $set: {
        lifecycleStatus: 'DELETED',
        deletedAt: new Date(),
        deletedBy: userId,
      },
    },
  );

  if (result.matchedCount === 0) throw new Error('Oportunidad no encontrada.');

  // Also delete associated notes and tasks
  await Promise.all([
    getModel('CRM_NOTES').deleteMany({ leadId, organizationId }),
    getModel('CRM_TASKS').deleteMany({ leadId, organizationId }),
  ]);

  return { success: true };
};