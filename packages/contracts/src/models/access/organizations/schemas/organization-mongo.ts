import { Schema } from 'mongoose';
import { type Organization } from './organization';
import { opts } from '../../../../common';

export const OrganizationSchemaMongo = new Schema<Organization>(
  {
    name: { type: String, required: true },
    slug: { type: String },
  },

  { ...opts },
);
