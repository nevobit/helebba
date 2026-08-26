import type { RouteOptions } from 'fastify';
import {
  addCrmOpportunityNote,
  deleteCrmOpportunity,
  deleteCrmOpportunityNote,
  getCrmOpportunity,
  listCrmOpportunityNotes,
  updateCrmOpportunity,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { CrmOpportunity, CrmOpportunityId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as OrganizationId,
  userId: (req.auth as { userId: UserId }).userId,
});

const get = makeFastifyRoute(
  RouteMethod.GET,
  '/:dealId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { dealId } = req.params as { dealId: CrmOpportunityId };
    const deal = await getCrmOpportunity(dealId, organizationId);
    if (!deal) return void reply.status(404).send({ message: 'Oportunidad no encontrada.' });
    reply.status(200).send(deal);
  },
);

const notesList = makeFastifyRoute(
  RouteMethod.GET,
  '/:dealId/notes',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { dealId } = req.params as { dealId: CrmOpportunityId };
    reply.status(200).send(await listCrmOpportunityNotes(dealId, organizationId));
  },
);

const noteCreate = makeFastifyRoute(
  RouteMethod.POST,
  '/:dealId/notes',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { dealId } = req.params as { dealId: CrmOpportunityId };
    const { content, color, title } = req.body as {
      content: string;
      color?: string;
      title?: string;
    };
    reply
      .status(201)
      .send(await addCrmOpportunityNote(dealId, organizationId, userId, content, color, title));
  },
);

const noteUpdate = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:dealId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { noteId } = req.params as { noteId: string };
    const body = req.body as { content?: string; color?: string; title?: string };
    reply.status(200).send(await updateCrmOpportunityNote(noteId, organizationId, body));
  },
);

const update = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:dealId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { dealId } = req.params as { dealId: CrmOpportunityId };
    reply
      .status(200)
      .send(
        await updateCrmOpportunity(
          dealId,
          organizationId,
          userId,
          req.body as Partial<CrmOpportunity>,
        ),
      );
  },
);

const remove = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:dealId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { dealId } = req.params as { dealId: CrmOpportunityId };
    await deleteCrmOpportunity(dealId, organizationId, userId);
    reply.status(200).send({ success: true });
  },
);

const noteDelete = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:dealId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { noteId } = req.params as { noteId: string };
    await deleteCrmOpportunityNote(noteId, organizationId);
    reply.status(200).send({ success: true });
  },
);

export const crmDealRoutes: RouteOptions[] = withPrefix('/crm/deals', [
  get,
  update,
  remove,
  notesList,
  noteCreate,
  noteUpdate,
  noteDelete,
]);
