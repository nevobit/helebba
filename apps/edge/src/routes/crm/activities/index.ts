import type { RouteOptions } from 'fastify';
import {
  createCrmActivity,
  listCrmActivities,
  listCrmActivityOpportunities,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});
const list = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const query = req.query as Record<string, string | undefined>;
    reply
      .status(200)
      .send(
        await listCrmActivities(organizationId, {
          opportunityId: query.opportunityId,
          completed: query.completed === undefined ? undefined : query.completed === 'true',
          search: query.search,
          from: query.from ? new Date(query.from) : undefined,
          to: query.to ? new Date(query.to) : undefined,
        }),
      );
  },
);
const create = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createCrmActivity(organizationId, userId, req.body as never));
  },
);
const opportunityList = makeFastifyRoute(
  RouteMethod.GET,
  '/opportunities',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    reply.status(200).send(await listCrmActivityOpportunities(context(req).organizationId));
  },
);
export const crmActivityRoutes: RouteOptions[] = withPrefix('/crm/activities', [
  list,
  create,
  opportunityList,
]);
