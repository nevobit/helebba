import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  type OrganizationId,
  type Role,
  type RoleId,
  RoleSchemaMongo,
  type UserId,
} from '@hlb/contracts';
import { ALL_PERMISSION_KEYS } from './defaults';

export type UpdateRoleInput = {
  organizationId: OrganizationId;
  roleId: RoleId;
  userId: UserId;
  name?: string;
  description?: string;
  permissionKeys?: string[];
};

const normalizePermissionKeys = (permissionKeys: string[]) => {
  const allowed = new Set(ALL_PERMISSION_KEYS);
  return [...new Set(permissionKeys.filter((key) => allowed.has(key)))];
};

export const updateRole = async ({
  description,
  name,
  organizationId,
  permissionKeys,
  roleId,
  userId,
}: UpdateRoleInput): Promise<Role> => {
  const model = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const role = await model.findOne({
    _id: roleId,
    organizationId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!role) {
    throw new Error('Role not found');
  }

  if (role.isSystem) {
    throw new Error('System roles cannot be edited');
  }

  const updatedRole = await model.findOneAndUpdate(
    {
      _id: roleId,
      organizationId,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    },
    {
      $set: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(permissionKeys !== undefined
          ? { permissionKeys: normalizePermissionKeys(permissionKeys) }
          : {}),
        updatedBy: userId,
      },
    },
    { new: true },
  );

  if (!updatedRole) {
    throw new Error('Role not found');
  }

  return updatedRole;
};
