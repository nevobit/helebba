import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { InventoryBrand } from './brand';

export const BrandSchemaMongo = new Schema<InventoryBrand>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    logoUrl: { type: String },
    website: { type: String },
    color: { type: String },
    position: { type: Number },
    parentId: { type: String },
  },
  { ...opts },
);
