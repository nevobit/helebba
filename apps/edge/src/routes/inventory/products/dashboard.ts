import { getInventoryDashboard } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getInventoryDashboardRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/dashboard',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (request, reply) =>
    reply.status(200).send(
      await getInventoryDashboard(request.organization!.organizationId as OrganizationId),
    ),
);
