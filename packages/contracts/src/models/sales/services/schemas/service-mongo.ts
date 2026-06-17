import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { Service } from './service';

export const ServiceSchemaMongo = new Schema<Service>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true },
    code: { type: String },
    description: { type: String },
    price: { type: Number },
    cost: { type: Number },
    timeInMinutes: { type: Number },
    tax: { type: Number },
    total: { type: Number },
    tags: { type: [String] },
    salesChannelId: { type: String },
    color: { type: String },
    duration: { type: String },
    archived: { type: Boolean },
  },
  { ...opts },
);
