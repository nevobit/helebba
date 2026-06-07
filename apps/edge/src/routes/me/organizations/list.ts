import { listMyOrganizations } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const listMyOrganizationsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'none', auth: 'required' },
  async (req, reply) => {
    const { userId } = req.auth as unknown as { userId: UserId };
    const organizations = await listMyOrganizations(userId);

    reply.status(200).send({ items: organizations });
  },
);
