import { Schema } from 'mongoose';
import { type Product } from './product';
import { opts } from '../../../common';

export const ProductSchemaMongo = new Schema<Product>(
  {
    name: { type: String, required: true },
  },
  { ...opts },
);
