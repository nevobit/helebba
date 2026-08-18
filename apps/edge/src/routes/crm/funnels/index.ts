import type { RouteOptions } from 'fastify';
import {
  createCrmFunnel,
  createCrmOpportunity,
  getCrmFunnel,
  listCrmFunnels,
  listCrmOpportunities,
  moveCrmOpportunity,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  CrmFunnel,
  CrmFunnelId,
  CrmOpportunity,
  CrmOpportunityId,
  CrmStageId,
  OrganizationId,
  UserId,
} from '@hlb/contracts';
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
    const { organizationId, userId } = context(req);
    reply.status(200).send(await listCrmFunnels(organizationId, userId));
  },
);
const create = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply
      .status(201)
      .send(
        await createCrmFunnel({
          ...(req.body as Partial<CrmFunnel>),
          organizationId,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
  },
);
const get = makeFastifyRoute(
  RouteMethod.GET,
  '/:funnelId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { funnelId } = req.params as { funnelId: CrmFunnelId };
    const funnel = await getCrmFunnel(funnelId, organizationId);
    if (!funnel) return void reply.status(404).send({ message: 'Embudo no encontrado.' });
    reply.status(200).send(funnel);
  },
);
const opportunityList = makeFastifyRoute(
  RouteMethod.GET,
  '/:funnelId/opportunities',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { funnelId } = req.params as { funnelId: CrmFunnelId };
    reply.status(200).send(await listCrmOpportunities(funnelId, organizationId));
  },
);
const opportunityCreate = makeFastifyRoute(
  RouteMethod.POST,
  '/:funnelId/opportunities',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { funnelId } = req.params as { funnelId: CrmFunnelId };
    reply
      .status(201)
      .send(
        await createCrmOpportunity({
          ...(req.body as Partial<CrmOpportunity>),
          funnelId,
          organizationId,
          createdBy: userId,
          updatedBy: userId,
        }),
      );
  },
);
const opportunityMove = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:funnelId/opportunities/:opportunityId/stage',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { opportunityId } = req.params as { opportunityId: CrmOpportunityId };
    const { stageId } = req.body as { stageId: CrmStageId };
    reply
      .status(200)
      .send(await moveCrmOpportunity(opportunityId, organizationId, userId, stageId));
  },
);
export const crmFunnelRoutes: RouteOptions[] = withPrefix('/crm/funnels', [
  list,
  create,
  get,
  opportunityList,
  opportunityCreate,
  opportunityMove,
]);
