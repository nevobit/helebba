import type { OrganizationId } from '../models';
import type { UserId } from '../models/identity';
import type { ISODateTimeString } from './datetime';
import type { LifecycleStatus } from './status';

export interface BaseEntity<TId, TStatus extends string = LifecycleStatus> {
  readonly id: TId;

  readonly createdAt: ISODateTimeString;
  readonly updatedAt: ISODateTimeString;

  readonly lifecycleStatus: TStatus;
}

export interface OrganizationScoped {
  readonly organizationId: OrganizationId;
}

export interface AuditableEntity<TUserId = UserId> {
  readonly createdBy: TUserId;
  readonly updatedBy: TUserId;
}

export interface SoftDeletableEntity<TUserId = UserId> {
  readonly deletedBy: TUserId | null;
  readonly deletedAt: ISODateTimeString | null;
}

export type PersistedEntity<TId, TUserId = UserId> = BaseEntity<TId> &
  OrganizationScoped &
  AuditableEntity<TUserId>;

export type PersistedSoftDeletableEntity<TId, TUserId = UserId> = PersistedEntity<TId, TUserId> &
  SoftDeletableEntity<TUserId>;
