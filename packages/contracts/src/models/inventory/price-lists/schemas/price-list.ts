import type { PersistedSoftDeletableEntity, PriceListId, UserId } from '../../../../common';

export interface PriceList extends PersistedSoftDeletableEntity<PriceListId, UserId> {
  name: string;
  currency: string;
  description: string;
}
