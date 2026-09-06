import type { RouteOptions } from 'fastify';
import {
  createCrmActivity,
  deleteCrmActivity,
  getCrmActivity,
  listCrmActivities,
  listCrmActivityOpportunities,
  updateCrmActivity,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { CrmActivityId, OrganizationId, UserId } from '@hlb/contracts';
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
    reply.status(200).send(
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
const get = makeFastifyRoute(
  RouteMethod.GET,
  '/:activityId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const activity = await getCrmActivity(
      context(req).organizationId,
      (req.params as { activityId: CrmActivityId }).activityId,
    );
    if (!activity) return reply.status(404).send({ message: 'La actividad no existe.' });
    reply.status(200).send(activity);
  },
);
const update = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:activityId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply
      .status(200)
      .send(
        await updateCrmActivity(
          organizationId,
          userId,
          (req.params as { activityId: CrmActivityId }).activityId,
          req.body as never,
        ),
      );
  },
);
const remove = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:activityId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    await deleteCrmActivity(
      organizationId,
      userId,
      (req.params as { activityId: CrmActivityId }).activityId,
    );
    reply.status(200).send(true);
  },
);
export const crmActivityRoutes: RouteOptions[] = withPrefix('/crm/activities', [
  list,
  create,
  opportunityList,
  get,
  update,
  remove,
]);
