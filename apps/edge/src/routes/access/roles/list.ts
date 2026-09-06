import { listRoles } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { authorizeRolePermission } from './authorize';

export const listRolesRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    if (!(await authorizeRolePermission(req, reply, 'roles:read'))) return;

    const organizationId = req.organization?.organizationId as OrganizationId;
    const roles = await listRoles(organizationId);

    reply.status(200).send({ items: roles });
  },
);
