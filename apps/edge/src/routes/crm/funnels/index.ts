import type { RouteOptions } from 'fastify';
import {
  addCrmOpportunityNote,
  createCrmFunnel,
  createCrmOpportunity,
  deleteCrmFunnel,
  duplicateCrmFunnel,
  getCrmFunnel,
  getCrmOpportunity,
  listCrmFunnels,
  listCrmOpportunities,
  listCrmOpportunityNotes,
  moveCrmOpportunity,
  setCrmFunnelMembers,
  setCrmOpportunityStatus,
  updateCrmFunnel,
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
const opportunityStatus = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:funnelId/opportunities/:opportunityId/status',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { opportunityId } = req.params as { opportunityId: CrmOpportunityId };
    const { status } = req.body as { status: CrmOpportunity['status'] };
    if (!['open', 'won', 'lost'].includes(status))
      return void reply.status(400).send({ message: 'Estado inválido.' });
    reply
      .status(200)
      .send(await setCrmOpportunityStatus(opportunityId, organizationId, userId, status));
  },
);
const opportunityGet = makeFastifyRoute(
  RouteMethod.GET,
  '/:funnelId/opportunities/:opportunityId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { opportunityId } = req.params as { opportunityId: CrmOpportunityId };
    const opportunity = await getCrmOpportunity(opportunityId, organizationId);
    if (!opportunity) return void reply.status(404).send({ message: 'Oportunidad no encontrada.' });
    reply.status(200).send(opportunity);
  },
);
const opportunityNotesList = makeFastifyRoute(
  RouteMethod.GET,
  '/:funnelId/opportunities/:opportunityId/notes',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { opportunityId } = req.params as { opportunityId: CrmOpportunityId };
    reply.status(200).send(await listCrmOpportunityNotes(opportunityId, organizationId));
  },
);
const opportunityNoteCreate = makeFastifyRoute(
  RouteMethod.POST,
  '/:funnelId/opportunities/:opportunityId/notes',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { opportunityId } = req.params as { opportunityId: CrmOpportunityId };
    const { content, color, title } = req.body as {
      content: string;
      color?: string;
      title?: string;
    };
    reply
      .status(201)
      .send(await addCrmOpportunityNote(opportunityId, organizationId, userId, content, color, title));
  },
);
const membersUpdate = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:funnelId/members',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { funnelId } = req.params as { funnelId: CrmFunnelId };
    const { members } = req.body as { members: UserId[] };
    reply
      .status(200)
      .send(await setCrmFunnelMembers(funnelId, organizationId, userId, members ?? []));
  },
);
const funnelUpdate = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:funnelId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { funnelId } = req.params as { funnelId: CrmFunnelId };
    const body = req.body as { name?: string; description?: string };
    reply
      .status(200)
      .send(await updateCrmFunnel(funnelId, organizationId, userId, body));
  },
);
const funnelDelete = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:funnelId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { funnelId } = req.params as { funnelId: CrmFunnelId };
    reply.status(200).send(await deleteCrmFunnel(funnelId, organizationId, userId));
  },
);
const funnelDuplicate = makeFastifyRoute(
  RouteMethod.POST,
  '/:funnelId/duplicate',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { funnelId } = req.params as { funnelId: CrmFunnelId };
    reply.status(201).send(await duplicateCrmFunnel(funnelId, organizationId, userId));
  },
);
export const crmFunnelRoutes: RouteOptions[] = withPrefix('/crm/funnels', [
  list,
  create,
  get,
  funnelUpdate,
  funnelDelete,
  funnelDuplicate,
  opportunityList,
  opportunityCreate,
  opportunityMove,
  opportunityStatus,
  opportunityGet,
  opportunityNotesList,
  opportunityNoteCreate,
  membersUpdate,
]);
