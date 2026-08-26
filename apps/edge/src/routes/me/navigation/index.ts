import type { RouteOptions } from 'fastify';
import { getOrganizationNavigation, updateOrganizationNavigation } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { OrganizationId, OrganizationNavigationPreference, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
const get = makeFastifyRoute(
  RouteMethod.GET,
  '/navigation',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) =>
    reply
      .status(200)
      .send(await getOrganizationNavigation(req.organization?.organizationId as OrganizationId)),
);
const update = makeFastifyRoute(
  RouteMethod.PUT,
  '/navigation',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { userId } = req.auth as unknown as { userId: UserId };
    reply
      .status(200)
      .send(
        await updateOrganizationNavigation(
          req.organization?.organizationId as OrganizationId,
          userId,
          (req.body as { items?: OrganizationNavigationPreference[] }).items ?? [],
        ),
      );
  },
);
export const meNavigationRoutes: RouteOptions[] = [get, update];
