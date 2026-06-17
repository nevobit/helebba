import { Schema } from 'mongoose';
import { type Organization } from './organization';
import { baseFields, opts } from '../../../../common';

export const OrganizationSchemaMongo = new Schema<Organization>(
  {
    ...baseFields,
    name: { type: String, required: true },
    legalName: { type: String },
    taxId: { type: String },
    email: { type: String, unique: true },
    phone: { type: String },
    country: { type: String },
    currency: { type: String },
    timezone: { type: String },
    logoUrl: { type: String },
    type: { type: String },
    size: { type: String },
    structure: { type: String },
    website: { type: String },
    isPrincipal: { type: Boolean },
    slug: { type: String },
    ownerId: { type: String, ref: 'users' },
  },

  { ...opts },
);
