import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  PERMISSION_GROUPS,
  type Role,
  type RoleId,
  RoleSchemaMongo,
  SYSTEM_PERMISSIONS,
  SYSTEM_ROLE_CODES,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

const unique = (items: readonly string[]) => [...new Set(items)];

const permissionGroupValues = Object.values(PERMISSION_GROUPS).flat();
export const ALL_PERMISSION_KEYS = unique([...Object.values(SYSTEM_PERMISSIONS), ...permissionGroupValues]);

const readablePermissionKeys = unique([
  ...Object.values(SYSTEM_PERMISSIONS).filter((key) => key.endsWith(':read')),
  ...permissionGroupValues.filter((key) => key.endsWith(':read')),
]);

export type DefaultRoleDefinition = {
  code: string;
  name: string;
  description: string;
  permissionKeys: string[];
};

export const DEFAULT_ROLE_DEFINITIONS: DefaultRoleDefinition[] = [
  {
    code: SYSTEM_ROLE_CODES.TENANT_OWNER,
    name: 'Propietario',
    description: 'Control total de la cuenta, roles, usuarios y configuración.',
    permissionKeys: ALL_PERMISSION_KEYS,
  },
  {
    code: SYSTEM_ROLE_CODES.TENANT_ADMIN,
    name: 'Administrador',
    description: 'Administra la operación de la cuenta sin permisos de plataforma.',
    permissionKeys: ALL_PERMISSION_KEYS.filter((key) => !key.startsWith('platform:')),
  },
  {
    code: SYSTEM_ROLE_CODES.MEMBER,
    name: 'Miembro',
    description: 'Acceso operativo general con permisos de lectura y trabajo diario.',
    permissionKeys: unique([
      ...readablePermissionKeys,
      ...PERMISSION_GROUPS.CRM,
      ...PERMISSION_GROUPS.SALES,
      ...PERMISSION_GROUPS.INVENTORY,
    ]),
  },
  {
    code: SYSTEM_ROLE_CODES.VIEWER,
    name: 'Observador',
    description: 'Acceso de solo lectura a la información principal de la cuenta.',
    permissionKeys: readablePermissionKeys,
  },
];

export const seedDefaultRoles = async ({
  createdBy,
  organizationId,
}: {
  createdBy: UserId;
  organizationId: OrganizationId;
}) => {
  const model = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const existingRoles = await model.find({ organizationId });

  if (existingRoles.length) {
    return existingRoles;
  }

  return await model.create(
    DEFAULT_ROLE_DEFINITIONS.map((role) => ({
      ...role,
      organizationId,
      isSystem: true,
      createdBy,
      updatedBy: createdBy,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    })),
  );
};

export const getOwnerRole = async (organizationId: OrganizationId): Promise<Role> => {
  const model = getModel<Role>(Collection.ROLES, RoleSchemaMongo);
  const role = await model.findOne({
    organizationId,
    code: SYSTEM_ROLE_CODES.TENANT_OWNER,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!role) {
    throw new Error('Owner role not found');
  }

  return role;
};

export const getDefaultRoleId = async (organizationId: OrganizationId): Promise<RoleId> => {
  const role = await getOwnerRole(organizationId);
  return role.id as RoleId;
};
