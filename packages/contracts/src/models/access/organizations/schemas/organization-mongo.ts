import { Schema } from 'mongoose';
import { type Organization } from './organization';
import { baseFields, opts } from '../../../../common';

export const OrganizationSchemaMongo = new Schema<Organization>(
  {
    ...baseFields,
    name: { type: String, required: true },
    legalName: { type: String },
    taxId: { type: String },
    email: { type: String },
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
    navigationPreferences: [
      {
        _id: false,
        itemId: { type: String, required: true },
        isVisible: { type: Boolean, required: true },
        position: { type: Number },
        name: { type: String },
        icon: { type: String },
      },
    ],
  },

  { ...opts },
);
