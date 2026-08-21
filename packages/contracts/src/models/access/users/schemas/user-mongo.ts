import { Schema } from 'mongoose';
import { type User } from './user';
import { baseFields, opts } from '../../../../common';

export const UserSchemaMongo = new Schema<User>(
  {
    ...baseFields,
    name: { type: String, required: true },
    phone: { type: String },
    newsletter: { type: Boolean },
    photo: { type: String },
    provider: {
      google: { sub: { type: String }, email: { type: String } },
      apple: { sub: { type: String }, email: { type: String } },
      facebook: { type: String },
    },
    username: { type: String },
    email: { type: String, required: true },
  },

  { ...opts },
);
