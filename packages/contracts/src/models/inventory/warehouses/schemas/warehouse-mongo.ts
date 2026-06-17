import { Schema } from 'mongoose';
import type { Warehouse } from './warehouse';
import { baseFields, opts } from '../../../../common';

export const WarehouseSchemaMongo = new Schema<Warehouse>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: String },
    phone: { type: String },
    address: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: Number },
      province: { type: String },
      country: { type: String },
      countryCode: { type: String },
    },
    postalCode: { type: String },
    color: { type: String },
    icon: { type: String },
    isDefault: { type: Boolean },
    accountingAccount: { type: String },
    productsCount: { type: Number },
    totalStock: { type: Number },
  },

  { ...opts },
);
