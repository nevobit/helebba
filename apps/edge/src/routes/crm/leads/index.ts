import {
  createCrmLead,
  listCrmLeads,
  getCrmLead,
  updateCrmLead,
  deleteCrmLead,
  moveCrmLeadStage,
  updateCrmLeadDates,
  addCrmLeadNote,
  updateCrmLeadNote,
  deleteCrmLeadNote,
  addCrmLeadTask,
  updateCrmLeadTask,
  deleteCrmLeadTask,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { LeadId, CrmStageId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: { organization?: { organizationId?: unknown }; auth?: unknown }) => ({
  organizationId: req.organization?.organizationId as string,
  userId: (req.auth as { userId: string }).userId,
});

const list = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const query = req.query as Record<string, string>;
    const filters = {
      organizationId,
      funnelId: query.funnelId,
      stageId: query.stageId,
      contactId: query.contactId,
      assignedTo: query.assignedTo,
      status: query.status as 'open' | 'won' | 'lost' | undefined,
      tags: query.tags ? query.tags.split(',') : undefined,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
      sortBy: query.sortBy as 'order' | 'createdAt' | 'expectedCloseDate' | 'value' | undefined,
      sortOrder: query.sortOrder as 'asc' | 'desc' | undefined,
    };
    const result = await listCrmLeads({ ...filters, organizationId, userId });
    reply.status(200).send(result);
  },
);

const create = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const body = req.body as Record<string, unknown>;
    const lead = await createCrmLead({
      ...body,
      organizationId,
      createdBy: userId,
      updatedBy: userId,
    });
    reply.status(201).send(lead);
  },
);

const get = makeFastifyRoute(
  RouteMethod.GET,
  '/:leadId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { leadId } = req.params as { leadId: string };
    const lead = await getCrmLead(leadId, organizationId);
    if (!lead) return reply.status(404).send({ message: 'Oportunidad no encontrada.' });
    reply.status(200).send(lead);
  },
);

const update = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:leadId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { leadId } = req.params as { leadId: string };
    const body = req.body as Record<string, unknown>;
    const lead = await updateCrmLead(leadId, organizationId, userId, body);
    reply.status(200).send(lead);
  },
);

const remove = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:leadId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { leadId } = req.params as { leadId: string };
    await deleteCrmLead(leadId, organizationId, userId);
    reply.status(200).send({ success: true });
  },
);

const moveStage = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:leadId/stage',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { leadId } = req.params as { leadId: string };
    const { stageId } = req.body as { stageId: string };
    const lead = await moveCrmLeadStage(leadId, organizationId, userId, stageId);
    reply.status(200).send(lead);
  },
);

const updateDates = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:leadId/dates',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { leadId } = req.params as { leadId: string };
    const body = req.body as { expectedCloseDate?: string; dueDate?: string };
    const dates: { expectedCloseDate?: Date; dueDate?: Date } = {};
    if (body.expectedCloseDate) dates.expectedCloseDate = new Date(body.expectedCloseDate);
    if (body.dueDate) dates.dueDate = new Date(body.dueDate);
    const lead = await updateCrmLeadDates(
      leadId,
      organizationId,
      (req.auth as { userId: string }).userId,
      dates,
    );
    reply.status(200).send(lead);
  },
);

const addNote = makeFastifyRoute(
  RouteMethod.POST,
  '/:leadId/notes',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { leadId } = req.params as { leadId: string };
    const { content } = req.body as { content: string };
    const note = await addCrmLeadNote(leadId, organizationId, userId, content);
    reply.status(201).send(note);
  },
);

const updateNote = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:leadId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { noteId } = req.params as { noteId: string };
    const { content } = req.body as { content: string };
    const note = await updateCrmLeadNote(noteId, organizationId, userId, content);
    reply.status(200).send(note);
  },
);

const deleteNote = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:leadId/notes/:noteId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { noteId } = req.params as { noteId: string };
    await deleteCrmLeadNote(noteId, organizationId);
    reply.status(200).send({ success: true });
  },
);

const addTask = makeFastifyRoute(
  RouteMethod.POST,
  '/:leadId/tasks',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { leadId } = req.params as { leadId: string };
    const body = req.body as Record<string, unknown>;
    const task = await addCrmLeadTask(leadId, organizationId, userId, body);
    reply.status(201).send(task);
  },
);

const updateTask = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:leadId/tasks/:taskId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId, userId } = context(req);
    const { taskId } = req.params as { taskId: string };
    const body = req.body as Record<string, unknown>;
    const task = await updateCrmLeadTask(taskId, organizationId, userId, body);
    reply.status(200).send(task);
  },
);

const deleteTask = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:leadId/tasks/:taskId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { organizationId } = context(req);
    const { taskId } = req.params as { taskId: string };
    await deleteCrmLeadTask(taskId, organizationId);
    reply.status(200).send({ success: true });
  },
);

export const leadRoutes: RouteOptions[] = withPrefix('/crm/leads', [
  list,
  create,
  get,
  update,
  remove,
  moveStage,
  updateDates,
  addNote,
  updateNote,
  deleteNote,
  addTask,
  updateTask,
  deleteTask,
]);
