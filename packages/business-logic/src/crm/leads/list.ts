import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type CrmLead,
  type LeadId,
  type CrmFunnelId,
  type CrmStageId,
  type OrganizationId,
  type ContactId,
  CrmLeadSchemaMongo,
} from '@hlb/contracts';

const leads = () => getModel<CrmLead>(Collection.CRM_LEADS, CrmLeadSchemaMongo);

export const listCrmLeads = async (filters: {
  organizationId: OrganizationId;
  funnelId?: string;
  stageId?: string;
  contactId?: string;
  assignedTo?: string;
  status?: 'open' | 'won' | 'lost';
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'order' | 'createdAt' | 'expectedCloseDate' | 'value';
  sortOrder?: 'asc' | 'desc';
}) => {
  const {
    organizationId,
    funnelId,
    stageId,
    contactId,
    assignedTo,
    status,
    tags,
    page = 1,
    limit = 20,
    sortBy = 'order',
    sortOrder = 'asc',
  } = filters;

  const query: Record<string, unknown> = {
    organizationId,
    lifecycleStatus: { $ne: 'DELETED' },
  };

  if (funnelId) query.funnelId = funnelId;
  if (stageId) query.stageId = stageId;
  if (contactId) query.contactId = contactId;
  if (assignedTo) query.assignedTo = assignedTo;
  if (status) query.status = status;
  if (tags && tags.length > 0) query.tags = { $in: tags };

  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    leads().find(query).sort(sort).skip(skip).limit(limit).lean(),
    leads().countDocuments(query),
  ]);

  return {
    data: data as CrmLead[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
