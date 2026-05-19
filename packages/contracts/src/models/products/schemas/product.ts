import type {
  PersistedSoftDeletableEntity,
  UserId,
  CategoryId,
  ContactId,
  ProductId,
  CompanyId,
  TenantId,
} from '../../../common';

export enum ProductStockState {
  OutOfStock = 0,
  InStock = 1,
  Reserved = 2,
  LowStock = 3,
  MediumStock = 4,
  HighStock = 5,
  CriticalStock = 6,
  InTransit = 7,
  TemporarilyOutOfStock = 8,
  DefectiveStock = 9,
  PendingReview = 10,
}

export interface ProductVariant {
  id?: string;
  barcode: string;
  name: string;
  sku: string;
  factoryCode: string;
  price: number;
  color: string;
  size: string;
  cost: number;
  weight: number;
  purchasePrice: number;
  stock: number;
  variantId?: string;
}

interface CustomField {
  field: string;
  value: string;
}

export interface Product extends PersistedSoftDeletableEntity<ProductId, UserId> {
  kind: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  typeId: string;
  inCatalog: boolean;
  images: string[];
  customFields: CustomField[];
  contactId: string;
  contactName: string;
  price: number;
  cost: number;
  stockState: ProductStockState;
  taxes: string[];
  total: number;
  hasStock: boolean;
  stock: number;
  barcode: string;
  sku: string;
  purchasePrice: number;
  weight: number;
  tags: string[];
  categoryId: CategoryId;
  categories: string[];
  categoryOptions: string;
  factoryCode: string;
  forSale: boolean;
  forPurchase: boolean;
  forProduction: boolean;
  forService: boolean;
  forRepair: boolean;
  forMaintenance: boolean;
  forRent: boolean;
  salesChannelId: string;
  expAccountId: string;
  warehouseId: WarehouseId;
  companyId: CompanyId;
  tenantId: TenantId;
  notes: Note[];
  variants: ProductVariant[];
}
