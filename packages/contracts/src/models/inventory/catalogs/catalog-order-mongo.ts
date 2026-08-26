import { Schema } from 'mongoose';
import type { CatalogOrder } from './catalog-order';
import { opts } from '../../../common';

export const CatalogOrderSchemaMongo = new Schema<CatalogOrder>(
  {
    organizationId: { type: String, required: true, index: true },
    catalogId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'converted'], default: 'pending', index: true },
    currency: { type: String, required: true, default: 'COP' },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      company: String,
      taxId: String,
      notes: String,
    },
    lines: [{
      _id: false,
      productId: { type: String, required: true },
      variantId: String,
      name: { type: String, required: true },
      sku: String,
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true, min: 0 },
      taxRate: { type: Number, required: true, min: 0 },
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    }],
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    convertedDocumentId: String,
    confirmedAt: String,
  },
  { ...opts },
);

CatalogOrderSchemaMongo.index({ organizationId: 1, orderNumber: 1 }, { unique: true });
CatalogOrderSchemaMongo.index({ catalogId: 1, createdAt: -1 });
