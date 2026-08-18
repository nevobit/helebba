import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type { PosReceipt } from './pos';

export const PosReceiptSchemaMongo = new Schema<PosReceipt>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    storeId: { type: String, required: true, index: true },
    storeName: { type: String },
    registerId: { type: String, required: true },
    registerName: { type: String },
    sessionId: { type: String, required: true, index: true },
    number: { type: String, required: true },
    lines: [
      {
        _id: false,
        productId: { type: String, required: true },
        variantId: { type: String },
        name: { type: String },
        sku: { type: String },
        quantity: { type: Number, min: 0.001 },
        unitPrice: { type: Number, min: 0 },
        taxRate: { type: Number, min: 0 },
        subtotal: { type: Number, min: 0 },
        tax: { type: Number, min: 0 },
        total: { type: Number, min: 0 },
      },
    ],
    payments: [
      {
        _id: false,
        method: { type: String, enum: ['cash', 'card', 'bank_transfer', 'other'] },
        amount: { type: Number, min: 0 },
        reference: { type: String },
      },
    ],
    subtotal: { type: Number, min: 0 },
    tax: { type: Number, min: 0 },
    total: { type: Number, min: 0 },
    status: { type: String, enum: ['completed', 'refunded'], default: 'completed' },
  },
  { ...opts },
);
PosReceiptSchemaMongo.index({ organizationId: 1, number: 1 }, { unique: true });
