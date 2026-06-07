import { Schema } from 'mongoose';
import { type Membership } from './membership';
import { opts } from '../../../../common';

export const MembershipSchemaMongo = new Schema<Membership>(
  {
    userId: { type: String, required: true },
    invitedEmail: { type: String, required: true },
    roleIds: { type: [String], required: true },
    permissionKeys: { type: [String], required: true },
    title: { type: String },
    joinedAt: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'pending', 'invited', 'declined', 'removed'],
      required: true,
    },
    profile: {
      displayName: { type: String },
      signature: { type: String },
      avatar: { type: String },
      locale: { type: String },
    },
    preferences: {
      notifications: {
        email: { type: Boolean, required: true },
        inApp: { type: Boolean, required: true },
      },
    },
    invitedBy: { type: String },
    invitedAt: { type: Date },
  },
  { ...opts },
);
