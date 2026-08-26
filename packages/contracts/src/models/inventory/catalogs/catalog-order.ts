import type { CatalogId, CatalogOrderId, ISODateTimeString, OrganizationId, ProductId } from '../../../common';

export type CatalogOrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'converted';

export interface CatalogOrderCustomer {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  taxId?: string;
  notes?: string;
}

export interface CatalogOrderLine {
  productId: ProductId;
  variantId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CatalogOrder {
  id: CatalogOrderId;
  organizationId: OrganizationId;
  catalogId: CatalogId;
  orderNumber: string;
  status: CatalogOrderStatus;
  currency: string;
  customer: CatalogOrderCustomer;
  lines: CatalogOrderLine[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  convertedDocumentId?: string;
  confirmedAt?: ISODateTimeString;
}

export interface PublicCatalogProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  color?: { name: string; hex: string };
  size?: string;
  stock?: number;
  available: boolean;
}

export interface PublicCatalogProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  sku?: string;
  price?: number;
  taxRate: number;
  stock?: number;
  available: boolean;
  variants: PublicCatalogProductVariant[];
}

export interface PublicCatalog {
  id: string;
  publicId: string;
  name: string;
  slug: string;
  currency: string;
  settings: {
    showPrices: boolean;
    showStock: boolean;
    allowOutOfStockOrders: boolean;
    importProductDescription: boolean;
  };
  products: PublicCatalogProduct[];
}
