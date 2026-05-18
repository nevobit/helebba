import { Schema } from 'mongoose';
import { Product } from './product';

export const ProductSchemaMongo = new Schema<Product>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);
