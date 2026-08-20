import type {
  PersistedSoftDeletableEntity,
  UserId,
  CategoryId,
  ProductId,
  ProductFieldDefinitionId,
  CompanyId,
  WarehouseId,
} from '../../../../common';
import type { ProductFieldValue } from '../../product-field-definitions';

export const ProductStockState = {
  OutOfStock: 0,
  InStock: 1,
  Reserved: 2,
  LowStock: 3,
  MediumStock: 4,
  HighStock: 5,
  CriticalStock: 6,
  InTransit: 7,
  TemporarilyOutOfStock: 8,
  DefectiveStock: 9,
  PendingReview: 10,
} as const;

export type ProductStockState = (typeof ProductStockState)[keyof typeof ProductStockState];

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id?: string;
  barcode: string;
  name: string;
  sku: string;
  factoryCode: string;
  price: number;
  color: ProductColor;
  size: string;
  cost: number;
  weight: number;
  purchasePrice: number;
  stock: number;
  variantId?: string;
}

export interface CustomField {
  definitionId?: ProductFieldDefinitionId;
  field?: string;
  value: ProductFieldValue;
}

export interface ProductFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Product extends PersistedSoftDeletableEntity<ProductId, UserId> {
  kind: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  typeId: string;
  inCatalog: boolean;
  inPos: boolean;
  images: string[];
  files: ProductFile[];
  minStock: number;
  customFields: CustomField[];
  contactId: string;
  contactName: string;
  price: number;
  cost: number;
  stockState: ProductStockState;
  taxes: string[];
  total: number;
  taxRate: number;
  hasStock: boolean;
  stock: number;
  barcode: string;
  sku: string;
  purchasePrice: number;
  weight: number;
  tags: string[];
  categoryId: CategoryId;
  categories: CategoryId[];
  categoryOptions: string;
  factoryCode: string;
  forSale: boolean;
  forPurchase: boolean;
  forProduction: boolean;
  forService: boolean;
  forRepair: boolean;
  forMaintenance: boolean;
  forRent: boolean;
  manageLots: boolean;
  manageSerials: boolean;
  salesAccountId: string;
  purchaseAccountId: string;
  salesChannelId: string;
  expAccountId: string;
  warehouseId: WarehouseId;
  warehouseName?: string;
  companyId: CompanyId;
  // notes: Note[];
  variants: ProductVariant[];
}
