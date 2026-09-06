import type { SchemaDefinition, SchemaOptions } from 'mongoose';
import { LifecycleStatus } from './status';

export const schemaOptions = {
  timestamps: true,
  versionKey: false,
} as const satisfies SchemaOptions;

// Backwards-compatible name used by the existing Mongo schemas.
export const opts = schemaOptions;

export const baseFields = {
  lifecycleStatus: {
    type: String,
    enum: Object.values(LifecycleStatus),
    default: LifecycleStatus.ACTIVE,
    required: true,
  },
} as const satisfies SchemaDefinition;

export const organizationScopedFields = {
  organizationId: {
    type: String,
    required: true,
    index: true,
  },
} as const satisfies SchemaDefinition;

export const auditFields = {
  createdBy: {
    type: String,
    required: true,
  },

  updatedBy: {
    type: String,
    required: true,
  },
} as const satisfies SchemaDefinition;

export const softDeleteFields = {
  deletedAt: {
    type: Date,
    default: null,
  },

  deletedBy: {
    type: String,
    default: null,
  },
} as const satisfies SchemaDefinition;
