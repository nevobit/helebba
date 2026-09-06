import type { RouteOptions } from 'fastify';
import {
  createExpenseAccount,
  createJournalEntry,
  listExpenseAccounts,
  listJournalEntries,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { ExpenseAccount, JournalEntry, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const options = { organization: 'required', auth: 'required' } as const;
const context = (req: any) => ({
  organizationId: req.organization.organizationId as OrganizationId,
  userId: req.auth.userId as UserId,
});

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/chart-of-accounts', verifyJwt, options, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listExpenseAccounts({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/accounts', verifyJwt, options, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createExpenseAccount({
      ...(req.body as Partial<ExpenseAccount>),
      organizationId,
      createdBy: userId,
      updatedBy: userId,
    }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/ledger', verifyJwt, options, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listJournalEntries({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/ledger', verifyJwt, options, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createJournalEntry({
      ...(req.body as Partial<JournalEntry>),
      organizationId,
      createdBy: userId,
      updatedBy: userId,
    }));
  }),
];

export const accountingCompatibilityRoutes = withPrefix('/accounting', routes);
