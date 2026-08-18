import type {
  ContactId,
  CrmFunnelId,
  CrmOpportunityId,
  CrmStageId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../common';

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
