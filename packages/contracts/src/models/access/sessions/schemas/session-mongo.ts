import { Schema } from 'mongoose';
import { type Session } from './session';
import { baseFields, opts } from '../../../../common';

export const SessionSchemaMongo = new Schema<Session>(
  {
    ...baseFields,
    userId: { type: String, required: true },
    organizationId: { type: String, ref: 'accounts' },
    refreshTokenHash: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
    status: { type: String, enum: ['active', 'revoked'], required: true, default: 'active' },
    device: {
      userAgent: { type: String },
      ipAddress: { type: String },
      type: { type: String, enum: ['desktop', 'mobile', 'tablet', 'other'] },
    },
    expiresAt: { type: String, required: true },
    revokedAt: { type: Date },
    createdBy: { type: String, required: true, ref: 'users' },
    updatedBy: { type: String, required: true, ref: 'users' },
    deletedBy: { type: String, ref: 'users' },
  },
  opts,
);

SessionSchemaMongo.index({ refreshTokenHash: 1 }, { unique: true });
