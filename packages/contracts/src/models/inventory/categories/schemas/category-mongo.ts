import { Schema } from 'mongoose';
import { type Category } from './category';
import { baseFields, opts } from '../../../../common';

export const CategorySchemaMongo = new Schema<Category>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true },
    slug: { type: String },
    description: { type: String },
    type: { type: String },
    color: { type: String },
    icon: { type: String },
    options: [{ type: String }],
    position: { type: Number },
    showInCatalog: { type: Boolean },
    parentId: { type: String },
  },
  { ...opts },
);
