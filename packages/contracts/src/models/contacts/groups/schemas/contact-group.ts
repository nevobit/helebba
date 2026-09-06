import type { GroupId, PersistedSoftDeletableEntity, UserId } from '../../../../common';

export interface ContactGroup extends PersistedSoftDeletableEntity<GroupId, UserId> {
  name: string;
  description?: string;
  color?: string;
  position: number;
}
