import type { RouteOptions } from 'fastify';
import { getCrmPreferences, updateCrmPreferences } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { CrmPreferences, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});

const get = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(200).send(await getCrmPreferences(organizationId, userId));
  },
);

const update = makeFastifyRoute(
  RouteMethod.PUT,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const body = req.body as Pick<CrmPreferences, 'activityTypes' | 'salesTeams'>;
    reply.status(200).send(await updateCrmPreferences(organizationId, userId, body));
  },
);

export const crmPreferenceRoutes: RouteOptions[] = withPrefix('/crm/preferences', [get, update]);
