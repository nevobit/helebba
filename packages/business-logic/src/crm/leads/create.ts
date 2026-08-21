import { Collection, getModel } from '@hlb/constant-definitions';
import { CrmLeadSchemaMongo, LifecycleStatus, type CrmLead, type LeadId, type CrmFunnelId, type CrmStageId, type OrganizationId, type UserId, type ContactId } from '@hlb/contracts';

const leads = () => getModel<CrmLead>(Collection.CRM_LEADS, CrmLeadSchemaMongo);

export const createCrmLead = async (data: {
  name: string;
  funnelId: CrmFunnelId;
  stageId?: CrmStageId;
  contactId: ContactId;
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
  customFields?: Array<{ fieldId: string; value: string | number | boolean }>;
  stagnationDays?: number;
  organizationId: OrganizationId;
  createdBy: UserId;
  updatedBy: UserId;
}) => {
  if (!data.name?.trim()) throw new Error('Ingresa el nombre de la oportunidad.');
  if (!data.contactId) throw new Error('El contacto es obligatorio.');

  const funnel = await getModel('CRM_FUNNELS').findOne({
    _id: data.funnelId,
    organizationId: data.organizationId,
  });
  if (!funnel) throw new Error('Embudo no encontrado.');

  let stageId = data.stageId;
  if (!stageId) {
    const firstStage = funnel.stages?.[0];
    if (!firstStage?.id) throw new Error('El embudo no tiene etapas configuradas.');
    stageId = firstStage.id;
  }

  if (!funnel.stages.some((s: { id: string }) => s.id === stageId)) {
    throw new Error('La etapa seleccionada no existe en el embudo.');
  }

  return leads().create({
    ...data,
    name: data.name.trim(),
    contactName: data.contactName.trim(),
    stageId,
    value: Number(data.value ?? 0),
    currency: data.currency || 'COP',
    notes: data.notes?.trim() ?? '',
    status: 'open',
    order: Date.now(),
    customFields: data.customFields ?? [],
    stagnationDays: data.stagnationDays ?? 0,
  });
};