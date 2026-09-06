import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { ContactTag } from './contact-tag';

export const ContactTagSchemaMongo = new Schema<ContactTag>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true, trim: true },
    color: { type: String },
  },
  { ...opts },
);

ContactTagSchemaMongo.index(
  { organizationId: 1, name: 1 },
  { unique: true, partialFilterExpression: { lifecycleStatus: { $ne: 'deleted' } } },
);
