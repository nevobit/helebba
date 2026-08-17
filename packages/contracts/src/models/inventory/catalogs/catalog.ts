import type { CatalogId, PersistedSoftDeletableEntity, ProductId, UserId, WarehouseId } from '../../../common';

export type CatalogSelectionMode = 'all' | 'specific';
export type CatalogSortOrder = 'manual' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export interface CatalogSettings {
  salesChannelId?: string;
  importProductDescription: boolean;
  showPrices: boolean;
  showExchangeRatePrices: boolean;
  allowLotSelection: boolean;
  stockWarehouseId?: WarehouseId;
  visibleStockWarehouseId?: WarehouseId;
  showStock: boolean;
  allowOutOfStockOrders: boolean;
}

export interface Catalog extends PersistedSoftDeletableEntity<CatalogId, UserId> {
  name: string;
  slug: string;
  publicId: string;
  active: boolean;
  selectionMode: CatalogSelectionMode;
  productIds: ProductId[];
  sortOrder: CatalogSortOrder;
  settings: CatalogSettings;
}
