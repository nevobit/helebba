import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type OrganizationId,
  type Role,
  RoleSchemaMongo,
  type UserId,
} from '@hlb/contracts';
import { ALL_PERMISSION_KEYS } from './defaults';

export type CreateRoleInput = {
  organizationId: OrganizationId;
  userId: UserId;
  name: string;
  description?: string;
  permissionKeys: string[];
};

const toRoleCode = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);

const normalizePermissionKeys = (permissionKeys: string[]) => {
  const allowed = new Set(ALL_PERMISSION_KEYS);
  return [...new Set(permissionKeys.filter((key) => allowed.has(key)))];
};

export const createRole = async ({
  description,
  name,
  organizationId,
  permissionKeys,
  userId,
}: CreateRoleInput): Promise<Role> => {
  const model = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const code = toRoleCode(name);

  if (!code) {
    throw new Error('Invalid role name');
  }

  const existing = await model.findOne({ organizationId, code });

  if (existing) {
    throw new Error('Role already exists');
  }

  return await model.create({
    name,
    code,
    description,
    organizationId,
    permissionKeys: normalizePermissionKeys(permissionKeys),
    isSystem: false,
    createdBy: userId,
    updatedBy: userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
};
