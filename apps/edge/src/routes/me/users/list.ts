import { listOrganizationUsers } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const listMyOrganizationUsersRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const users = await listOrganizationUsers(req.organization?.organizationId as OrganizationId);

    reply.status(200).send({ items: users });
  },
);
