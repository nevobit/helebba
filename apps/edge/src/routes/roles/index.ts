import { withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';
import { createRoleRoute } from './create';
import { deleteRoleRoute } from './delete';
import { listRolesRoute } from './list';
import { listPermissionCatalogRoute } from './permissions';
import { updateRoleRoute } from './update';

export const roleRoutes: RouteOptions[] = withPrefix('/roles', [
  listPermissionCatalogRoute,
  listRolesRoute,
  createRoleRoute,
  updateRoleRoute,
  deleteRoleRoute,
]);
