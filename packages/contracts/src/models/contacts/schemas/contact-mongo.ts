import { Schema } from 'mongoose';
import { type Contact } from './contact';
import { opts } from '../../../common';

export const  ContactSchemaMongo = new Schema<Contact>(
  {
    customId: { type: String },
    name: { type: String, required: true },
    code: { type: String },
    varnumber: { type: String },
    tradeName: { type: String },
    email: { type: String },
    mobile: { type: String },
    phone: { type: String },
    type: { type: String },
    iban: { type: String },
    swift: { type: String },
    groupId: { type: String },
    clientRecord: { type: String },
    isPerson: { type: Boolean },
    companyId: { type: String },
  },

  { ...opts },
);
