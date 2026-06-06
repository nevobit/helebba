import { Schema } from 'mongoose';
import { type User } from './user';
import { opts } from '../../../../common';

export const UserSchemaMongo = new Schema<User>(
  {
    customId: { type: String },
    name: { type: String, required: true },
    code: { type: String },
    varnumber: { type: String },
    tradeName: { type: String },
    email: { type: String, unique: true, required: true },
    mobile: { type: String },
    phone: { type: String },
    type: { type: String },
    iban: { type: String },
    swift: { type: String },
    groupId: { type: String },
    clientRecord: { type: String },
    isPerson: { type: Boolean },
  },

  { ...opts },
);
