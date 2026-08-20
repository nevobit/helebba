import { Schema } from 'mongoose';
import { type ProductNote } from './note';
import { baseFields, opts } from '../../../common';

export const ProductNoteSchemaMongo = new Schema<ProductNote>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { ...opts },
);