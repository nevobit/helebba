import { Schema } from 'mongoose';
import { type StockMovement } from './stock-movement';
import { baseFields, opts } from '../../../common';

export const StockMovementSchemaMongo = new Schema<StockMovement>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    variantId: { type: String },
    warehouseId: { type: String },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, default: '' },
    reference: { type: String },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    createdBy: { type: String },
  },
  { ...opts },
);