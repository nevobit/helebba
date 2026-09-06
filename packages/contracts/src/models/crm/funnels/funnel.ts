import type {
  Brand,
  ContactId,
  CrmFunnelId,
  CrmOpportunityId,
  CrmStageId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../common';

export type LeadId = Brand<string, 'LeadId'>;

export interface CrmStage {
  id: CrmStageId;
  name: string;
  color: string;
  order: number;
  probability: number;
  description?: string;
  stagnationDays?: number;
}

export interface CrmFunnel extends PersistedSoftDeletableEntity<CrmFunnelId, UserId> {
  name: string;
  description: string;
  isDefault: boolean;
  stages: CrmStage[];
  members?: UserId[];
}

export interface CrmOpportunity extends PersistedSoftDeletableEntity<CrmOpportunityId, UserId> {
  funnelId: CrmFunnelId;
  stageId: CrmStageId;
  name: string;
  contactId?: ContactId;
  contactName: string;
  companyId?: ContactId;
  companyName?: string;
  value: number;
  currency: string;
  expectedCloseDate?: Date;
  notes: string;
  assignedToName?: string;
  tags?: string[];
  probability?: number;
  relatedDocumentType?: string;
  relatedDocumentId?: string;
  status: 'open' | 'won' | 'lost';
  order: number;
}

export type CrmOpportunityActivityType = string;

export interface CrmActivityTypePreference {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CrmSalesTeam {
  id: string;
  name: string;
  color: string;
  icon: string;
  leaderId?: UserId;
  members: UserId[];
}

export interface CrmPreferences {
  id: string;
  organizationId: string;
  activityTypes: CrmActivityTypePreference[];
  salesTeams: CrmSalesTeam[];
  createdBy: UserId;
  updatedBy: UserId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmOpportunityActivity extends PersistedSoftDeletableEntity<
  import('../../../common').CrmActivityId,
  UserId
> {
  title: string;
  type: CrmOpportunityActivityType;
  opportunityId?: CrmOpportunityId;
  opportunityName?: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
  emailReminder: boolean;
  assignedTo?: UserId;
  assignedToName?: string;
  invitees?: UserId[];
  contactId?: ContactId;
  notes?: string;
  completed: boolean;
}

export interface CrmCustomField {
  fieldId: string;
  value: string | number | boolean;
}

export interface CrmNote {
  id: string;
  leadId: LeadId;
  organizationId: string;
  content: string;
  createdBy: UserId;
  createdAt: Date;
}

export interface CrmOpportunityNote {
  id: string;
  opportunityId: CrmOpportunityId;
  organizationId: string;
  title?: string;
  content: string;
  color?: string;
  createdBy: UserId;
  createdAt: Date;
}

export interface CrmTask {
  id: string;
  leadId: LeadId;
  organizationId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  assignedTo?: UserId;
  createdBy: UserId;
  createdAt: Date;
}

export interface CrmLead extends PersistedSoftDeletableEntity<LeadId, UserId> {
  funnelId: CrmFunnelId;
  stageId: CrmStageId;
  name: string;
  contactId: ContactId;
  contactName: string;
  companyId?: ContactId;
  companyName?: string;
  value: number;
  currency: string;
  expectedCloseDate?: Date;
  dueDate?: Date;
  potential?: number;
  notes?: string;
  assignedToName?: string;
  assignedTo?: UserId;
  tags?: string[];
  probability?: number;
  relatedDocumentType?: string;
  relatedDocumentId?: string;
  status: 'open' | 'won' | 'lost';
  order: number;
  customFields?: CrmCustomField[];
  stagnationDays?: number;
  tasks?: CrmTask[];
}

export interface CrmLeadFilters {
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
}
