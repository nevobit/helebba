import type { ContactTagId, PersistedSoftDeletableEntity, UserId } from '../../../../common';

export interface ContactTag extends PersistedSoftDeletableEntity<ContactTagId, UserId> {
  name: string;
  color?: string;
}
