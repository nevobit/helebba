import type { RouteOptions } from 'fastify';
import { getApiUsageByAutomationToken, getApiUsageByType } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const guard = [verifyJwt, { organization: 'required', auth: 'required' }] as const;
const organizationId = (req: { organization?: { organizationId?: unknown } }) =>
  req.organization?.organizationId as OrganizationId;

const automationTokens = makeFastifyRoute(
  RouteMethod.GET,
  '/automation-tokens',
  ...guard,
  async (req, reply) => {
    reply.status(200).send(await getApiUsageByAutomationToken(organizationId(req)));
  },
);

const byType = makeFastifyRoute(
  RouteMethod.GET,
  '/by-type',
  ...guard,
  async (req, reply) => {
    reply.status(200).send(await getApiUsageByType(organizationId(req)));
  },
);

export const developerUsageRoutes: RouteOptions[] = withPrefix('/developers/api-usage', [
  automationTokens,
  byType,
]);
