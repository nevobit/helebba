import { loginOrganization } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const switchOrganizationRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/session/organization',
  verifyJwt,
  { organization: 'none', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = req.body as { organizationId: OrganizationId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const out = await loginOrganization({ organizationId, userId });
    reply.status(200).send(out);
  },
);
