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
  value: number;
  currency: string;
  expectedCloseDate?: Date;
  notes: string;
  status: 'open' | 'won' | 'lost';
  order: number;
}
