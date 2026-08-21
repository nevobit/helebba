import { getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, type CrmLead, type LeadId, type OrganizationId, type UserId } from '@hlb/contracts';

const leads = () => getModel<CrmLead>('CRM_LEADS', 'CrmLeadSchemaMongo');

export const updateCrmLead = async (
  leadId: string,
  organizationId: string,
  userId: UserId,
  data: Partial<{
    name: string;
    stageId: string;
    contactId: string;
    contactName: string;
    companyId?: string;
    companyName?: string;
    value?: number;
    currency?: string;
    expectedCloseDate?: Date;
    dueDate?: Date;
    potential?: number;
    notes?: string;
    assignedToName?: string;
    assignedTo?: string;
    tags?: string[];
    probability?: number;
    relatedDocumentType?: string;
    relatedDocumentId?: string;
    status?: 'open' | 'won' | 'lost';
    order?: number;
    customFields?: Array<{ fieldId: string; value: string | number | boolean }>;
    stagnationDays?: number;
  }>
) => {
  const lead = await getModel('CRM_LEADS').findOne({
    _id: leadId,
    organizationId,
    lifecycleStatus: { $ne: 'DELETED' },
  });

  if (!lead) throw new Error('Oportunidad no encontrada.');

  if (data.name) data.name = data.name.trim();
  if (data.contactName) data.contactName = data.contactName.trim();
  if (data.notes) data.notes = data.notes.trim();

  const updated = await leads().findOneAndUpdate(
    { _id: leadId, organizationId },
    {
      $set: {
        ...data,
        updatedBy: leadId,
      },
    },
    { new: true },
  );

  if (!updated) throw new Error('No se pudo actualizar la oportunidad.');

  return updated;
};