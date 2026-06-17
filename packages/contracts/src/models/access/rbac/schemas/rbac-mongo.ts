import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { Permission, Role } from './rbac';

export const RoleSchemaMongo = new Schema<Role>(
  {
    ...baseFields,
    name: { type: String, required: true },
    code: { type: String, required: true },
    organizationId: { type: String, required: true, ref: 'organizations' },
    description: { type: String },
    permissionKeys: { type: [String], required: true },
    isSystem: { type: Boolean, required: true, default: false },
    createdBy: { type: String, required: true, ref: 'users' },
    updatedBy: { type: String, required: true, ref: 'users' },
  },
  opts,
);

RoleSchemaMongo.index({ organizationId: 1, code: 1 }, { unique: true });

export const PermissionSchemaMongo = new Schema<Permission>(
  {
    ...baseFields,
    key: { type: String, required: true, unique: true },
    resource: { type: String, required: true },
    action: { type: String, required: true },
    scope: { type: String, enum: ['platform', 'tenant', 'workspace', 'own'], required: true },
    effect: { type: String, enum: ['allow', 'deny'], required: true, default: 'allow' },
    description: { type: String },
    organizationId: { type: String, required: true, ref: 'organizations' },
    createdBy: { type: String, required: true, ref: 'users' },
    updatedBy: { type: String, required: true, ref: 'users' },
  },
  opts,
);
