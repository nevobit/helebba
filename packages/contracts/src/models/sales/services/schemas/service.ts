import type { PersistedSoftDeletableEntity, ServiceId, UserId } from '../../../../common';

export interface Service extends PersistedSoftDeletableEntity<ServiceId, UserId> {
  name: string;
  code: string;
  description: string;
  price: number;
  cost: number;
  timeInMinutes: number;
  tax: number;
  total: number;
  tags: string[];
  salesChannelId: string;
  color: string;
  duration: string;
  archived: boolean;
}
