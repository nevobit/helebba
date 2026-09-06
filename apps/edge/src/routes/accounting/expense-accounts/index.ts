import type { RouteOptions } from 'fastify';
import { createExpenseAccount, deleteExpenseAccount, getExpenseAccount, listExpenseAccounts, updateExpenseAccount } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { ExpenseAccount, ExpenseAccountId, OrganizationId, UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

const context = (req: any) => ({ organizationId: req.organization.organizationId as OrganizationId, userId: req.auth.userId as UserId });

const routes: RouteOptions[] = [
  makeFastifyRoute(RouteMethod.GET, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await listExpenseAccounts({ ...(req.query as any), organizationId }));
  }),
  makeFastifyRoute(RouteMethod.POST, '/', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.status(201).send(await createExpenseAccount({ ...(req.body as Partial<ExpenseAccount>), organizationId, createdBy: userId, updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.GET, '/:expenseAccountId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId } = context(req);
    reply.send(await getExpenseAccount((req.params as any).expenseAccountId as ExpenseAccountId, organizationId));
  }),
  makeFastifyRoute(RouteMethod.PATCH, '/:expenseAccountId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await updateExpenseAccount((req.params as any).expenseAccountId as ExpenseAccountId, organizationId, { ...(req.body as Partial<ExpenseAccount>), updatedBy: userId }));
  }),
  makeFastifyRoute(RouteMethod.DELETE, '/:expenseAccountId', verifyJwt, { organization: 'required', auth: 'required' }, async (req, reply) => {
    const { organizationId, userId } = context(req);
    reply.send(await deleteExpenseAccount((req.params as any).expenseAccountId as ExpenseAccountId, organizationId, userId));
  }),
];

export const expenseAccountRoutes = withPrefix('/expense-accounts', routes);
