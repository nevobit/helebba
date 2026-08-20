import { Schema } from 'mongoose';
import { type PriceList } from './price-list';
import { baseFields, opts } from '../../../../common';

export const PriceListSchemaMongo = new Schema<PriceList>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true },
    currency: { type: String, default: 'COP' },
    description: { type: String },
  },
  { ...opts },
);