import { LifecycleStatus } from './constants';

declare const brand: unique symbol;

export type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type EntityId = Brand<string, 'EntityId'>;
export type OrganizationId = Brand<string, 'OrganizationId'>;
export type UserId = Brand<string, 'UserId'>;
export type BranchId = Brand<string, 'BranchId'>;
export type ISODateTimeString = Brand<string, 'ISODateTimeString'>;
export type ContactId = Brand<string, 'ContactId'>;
export type ProductId = Brand<string, 'ProductId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type BrandId = Brand<string, 'BrandId'>;
export type PaymentMethodId = Brand<string, 'PaymentMethodId'>;
export type PaymentId = Brand<string, 'PaymentId'>;
export type BankingAccountId = Brand<string, 'BankingAccountId'>;
export type TreasuryMovementId = Brand<string, 'TreasuryMovementId'>;
export type GroupId = Brand<string, 'GroupId'>;
export type CompanyId = Brand<string, 'CompanyId'>;
export type WarehouseId = Brand<string, 'WarehouseId'>;
export type SubscriptionId = Brand<string, 'SubscriptionId'>;
export type PriceListId = Brand<string, 'PriceListId'>;
export type ServiceId = Brand<string, 'ServiceId'>;
export type DocumentId = Brand<string, 'DocumentId'>;
export type ApiKeyId = Brand<string, 'ApiKeyId'>;

export interface BaseEntity<TId = EntityId> {
  readonly id: TId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly lifecycleStatus: LifecycleStatus;
}

export interface OrganizationScoped {
  readonly organizationId: OrganizationId;
}

export interface AuditableEntity<TUserId = UserId> {
  readonly createdBy: TUserId;
  readonly updatedBy: TUserId;
}

export interface SoftDeletableEntity<TUserId = UserId> {
  readonly deletedBy: TUserId;
  readonly deletedAt: Date | null;
}

export type PersistedEntity<TId = EntityId, TUserId = UserId> = BaseEntity<TId> &
  OrganizationScoped &
  AuditableEntity<TUserId>;

export type PersistedSoftDeletableEntity<TId = EntityId, TUserId = UserId> = PersistedEntity<
  TId,
  TUserId
> &
  SoftDeletableEntity<TUserId>;

export type PaginationParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type OrganizationParams = {
  organizationId?: OrganizationId;
};

export type Params<TExtra extends Record<string, unknown> = Record<string, never>> =
  PaginationParams & OrganizationParams & TExtra;
