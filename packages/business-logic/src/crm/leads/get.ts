import { getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, type CrmLead, type LeadId, type OrganizationId } from '@hlb/contracts';

const getLeadModel = () => getModel('CRM_LEADS', 'CrmLeadSchemaMongo');
const getNoteModel = () => getModel('CRM_NOTES', 'CrmNoteSchemaMongo');
const getTaskModel = () => getModel('CRM_TASKS', 'CrmTaskSchemaMongo');

export const getCrmLead = async (leadId: string, organizationId: string) => {
  const lead = await getLeadModel().findOne({
    _id: leadId,
    organizationId,
    lifecycleStatus: { $ne: 'DELETED' },
  }).lean();

  if (!lead) return null;

  // Populate notes and tasks
  const [notes, tasks] = await Promise.all([
    getNoteModel().find({ leadId, organizationId }).sort({ createdAt: -1 }).lean(),
    getTaskModel().find({ leadId: lead._id.toString(), organizationId }).sort({ createdAt: -1 }).lean(),
  ]);

  return {
    ...lead,
    notes,
    tasks,
  };
};