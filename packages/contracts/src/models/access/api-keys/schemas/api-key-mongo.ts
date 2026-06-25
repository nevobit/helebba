import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { ExternalApiKey } from './api-key';

export const ApiKeySchemaMongo = new Schema<ExternalApiKey>(
  {
    ...baseFields,
    name: { type: String, required: true },
    keyHash: { type: String, required: true, unique: true, index: true },
    keyPrefix: { type: String, required: true },
    keyLast4: { type: String, required: true },
    scopes: { type: [String], required: true, default: [] },
    products: { type: [String], required: true, default: [] },
    status: { type: String, enum: ['active', 'revoked'], required: true, default: 'active' },
    organizationId: { type: String, required: true, index: true },
    lastUsedAt: { type: Date },
    expiresAt: { type: Date },
    revokedAt: { type: Date },
    revokedBy: { type: String, ref: 'users' },
    createdBy: { type: String, required: true, ref: 'users' },
    updatedBy: { type: String, required: true, ref: 'users' },
    deletedBy: { type: String, ref: 'users' },
  },
  opts,
);

ApiKeySchemaMongo.index({ organizationId: 1, status: 1, createdAt: -1 });
