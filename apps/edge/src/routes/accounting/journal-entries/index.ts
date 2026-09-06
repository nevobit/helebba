import type { RouteOptions } from 'fastify';
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntry,
  listJournalEntries,
  postJournalEntry,
  updateJournalEntry,
  voidJournalEntry,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { JournalEntry, JournalEntryId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({ organizationId: req.organization.organizationId as OrganizationId, userId: req.auth.userId as UserId });

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await listJournalEntries({ ...(req.query as any), organizationId: context(req).organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createJournalEntry({ ...(req.body as Partial<JournalEntry>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:journalEntryId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await getJournalEntry((req.params as any).journalEntryId as JournalEntryId, context(req).organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:journalEntryId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateJournalEntry((req.params as any).journalEntryId as JournalEntryId, organizationId, { ...(req.body as Partial<JournalEntry>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/:journalEntryId/post', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await postJournalEntry((req.params as any).journalEntryId as JournalEntryId, organizationId, userId));
  }),
  makeFastifyRoute(RouteMethod.POST, '/:journalEntryId/void', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await voidJournalEntry((req.params as any).journalEntryId as JournalEntryId, organizationId, userId));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:journalEntryId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await deleteJournalEntry((req.params as any).journalEntryId as JournalEntryId, organizationId, userId));
  }),
];

export const journalEntryRoutes = withPrefix('/journal-entries', routes);
