import { listPermissionCatalog } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyJwt } from '@hlb/security';
import { authorizeRolePermission } from './authorize';

export const listPermissionCatalogRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/permissions',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    if (!(await authorizeRolePermission(req, reply, 'permissions:read'))) return;

    reply.status(200).send(listPermissionCatalog());
  },
);
