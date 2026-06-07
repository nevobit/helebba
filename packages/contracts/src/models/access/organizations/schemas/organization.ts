import type { OrganizationId, PersistedSoftDeletableEntity, UserId } from '../../../../common';

export interface Organization extends PersistedSoftDeletableEntity<OrganizationId, UserId> {
  name: string;
  legalName: string;
  type: string;
  country: string;
  size: string;
  structure: string;
  website: string;
  isPrincipal: boolean;
  slug: string;
  ownerId: UserId;
}
