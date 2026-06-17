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
      google: { type: String },
      apple: { type: String },
      facebook: { type: String },
    },
    username: { type: String },
    email: { type: String, required: true },
  },

  { ...opts },
);
