import type { RouteOptions } from 'fastify';
import {
  createRecurringDocument,
  deleteRecurringDocument,
  generateDueRecurringDocuments,
  getRecurringDocument,
  listRecurringDocuments,
  updateRecurringDocument,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  OrganizationId,
  RecurringDocument,
  RecurringDocumentId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({
  organizationId: req.organization.organizationId as OrganizationId,
  userId: req.auth.userId as UserId,
});

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await listRecurringDocuments({ ...(req.query as any), organizationId: context(req).organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createRecurringDocument({ ...(req.body as Partial<RecurringDocument>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/run-due', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    const limit = Number((req.body as any)?.limit ?? 100);
    reply.status(201).send(await generateDueRecurringDocuments({ organizationId, userId, limit }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:recurringId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    reply.send(await getRecurringDocument((req.params as any).recurringId as RecurringDocumentId, context(req).organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:recurringId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateRecurringDocument((req.params as any).recurringId as RecurringDocumentId, organizationId, { ...(req.body as Partial<RecurringDocument>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:recurringId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await deleteRecurringDocument((req.params as any).recurringId as RecurringDocumentId, organizationId, userId));
  }),
];

export const recurringDocumentRoutes = withPrefix('/recurring-invoices', routes);
