import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { ProductFieldDefinition } from './product-field-definition';

export const ProductFieldDefinitionSchemaMongo = new Schema<ProductFieldDefinition>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    target: { type: String, required: true, default: 'product' },
    required: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    appliesTo: { type: String, required: true, default: 'all' },
    categoryIds: { type: [String], default: [] },
    options: {
      type: [{ _id: false, label: { type: String, required: true }, value: { type: String, required: true } }],
      default: [],
    },
    defaultValue: { type: Schema.Types.Mixed, default: null },
  },
  { ...opts },
);

ProductFieldDefinitionSchemaMongo.index({ organizationId: 1, key: 1 }, { unique: true });
