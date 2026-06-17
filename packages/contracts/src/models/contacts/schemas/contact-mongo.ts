import { Schema } from 'mongoose';
import { type Contact } from './contact';
import { baseFields, opts } from '../../../common';

export const ContactSchemaMongo = new Schema<Contact>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    customId: { type: String },
    name: { type: String, required: true },
    code: { type: String },
    vatnumber: { type: String },
    tradeName: { type: String },
    email: { type: String },
    mobile: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    department: { type: String },
    country: { type: String },
    website: { type: String },
    tags: { type: [String] },
    assignedUserIds: { type: [String] },
    type: { type: String },
    iban: { type: String },
    swift: { type: String },
    bankAccounts: {
      type: [
        {
          _id: false,
          bank: { type: String },
          accountNumber: { type: String },
          swift: { type: String },
          accountType: { type: String },
          holderName: { type: String },
          currency: { type: String },
          reference: { type: String },
          isDefault: { type: Boolean },
        },
      ],
      default: undefined,
    },
    groupId: { type: String },
    clientRecord: { type: String },
    isPerson: { type: Boolean },
    companyId: { type: String },
  },

  { ...opts },
);
