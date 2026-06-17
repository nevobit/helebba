import { PERMISSION_GROUPS, SYSTEM_PERMISSIONS } from '@hlb/contracts';
import { ALL_PERMISSION_KEYS } from './defaults';

export const listPermissionCatalog = () => ({
  permissions: ALL_PERMISSION_KEYS.map((key) => ({
    key,
    label: key,
  })),
  groups: PERMISSION_GROUPS,
  systemPermissions: SYSTEM_PERMISSIONS,
});
