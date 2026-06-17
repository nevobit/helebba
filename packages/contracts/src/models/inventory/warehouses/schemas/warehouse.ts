import type { PersistedSoftDeletableEntity, UserId, WarehouseId } from '../../../../common';

export interface WarehouseAddress {
  address: string;
  city: string;
  postalCode: number;
  province: string;
  country: string;
  countryCode: string;
}

export interface Warehouse extends PersistedSoftDeletableEntity<WarehouseId, UserId> {
  userId: UserId;
  name: string;
  email: string;
  mobile: string;
  phone: string;
  address: WarehouseAddress;
  postalCode: string;
  color: string;
  icon: string;
  isDefault: boolean;
  accountingAccount?: string;
  productsCount: number;
  totalStock: number;
}
