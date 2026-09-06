import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { ContactGroup } from './contact-group';

export const ContactGroupSchemaMongo = new Schema<ContactGroup>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    color: { type: String },
    position: { type: Number, default: 0 },
  },
  { ...opts },
);

ContactGroupSchemaMongo.index(
  { organizationId: 1, name: 1 },
  { unique: true, partialFilterExpression: { lifecycleStatus: { $ne: 'deleted' } } },
);
