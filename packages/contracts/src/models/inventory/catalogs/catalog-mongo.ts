import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type { Catalog } from './catalog';

export const CatalogSchemaMongo = new Schema<Catalog>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true },
    selectionMode: { type: String, enum: ['all', 'specific'], default: 'all' },
    productIds: [{ type: String }],
    sortOrder: { type: String, enum: ['manual', 'name-asc', 'name-desc', 'price-asc', 'price-desc'], default: 'manual' },
    settings: {
      salesChannelId: { type: String },
      importProductDescription: { type: Boolean, default: true },
      showPrices: { type: Boolean, default: true },
      showExchangeRatePrices: { type: Boolean, default: false },
      allowLotSelection: { type: Boolean, default: false },
      stockWarehouseId: { type: String },
      visibleStockWarehouseId: { type: String },
      showStock: { type: Boolean, default: false },
      allowOutOfStockOrders: { type: Boolean, default: false },
    },
  },
  { ...opts },
);

CatalogSchemaMongo.index({ organizationId: 1, slug: 1 }, { unique: true });
