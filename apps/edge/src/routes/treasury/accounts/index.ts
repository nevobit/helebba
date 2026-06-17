import {
  archiveTreasuryAccount,
  createTreasuryAccount,
  createTreasuryMovement,
  getAllTreasuryAccounts,
  getTreasuryAccountById,
  getTreasuryMovements,
  reconcileTreasuryMovement,
  softDeleteTreasuryAccount,
  updateTreasuryAccount,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type {
  BankingAccount,
  BankingAccountId,
  OrganizationId,
  TreasuryAccountKind,
  TreasuryMovement,
  TreasuryMovementId,
  UserId,
} from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import type { RouteOptions } from 'fastify';

type AccountListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  kind?: TreasuryAccountKind | 'all';
  includeArchived?: string;
};

type MovementListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  reconciliationStatus?: string;
};

const getOrganizationId = (req: { organization?: { organizationId: string } }) =>
  req.organization?.organizationId as OrganizationId;

const getUserId = (req: { auth?: { userId: string } }) => req.auth?.userId as UserId;

export const treasuryAccountRoutes: RouteOptions[] = withPrefix('/treasury/accounts', [
  makeFastifyRoute(
    RouteMethod.GET,
    '/',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const query = (req.query ?? {}) as AccountListQuery;
      const accounts = await getAllTreasuryAccounts({
        organizationId: getOrganizationId(req),
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 100),
        search: query.search ?? '',
        kind: query.kind ?? 'all',
        includeArchived: query.includeArchived === 'true',
      });

      reply.status(200).send(accounts);
    },
  ),
  makeFastifyRoute(
    RouteMethod.POST,
    '/',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const body = req.body as Partial<BankingAccount>;
      const userId = getUserId(req);
      const account = await createTreasuryAccount({
        ...body,
        organizationId: getOrganizationId(req),
        createdBy: userId,
        updatedBy: userId,
      });

      reply.status(201).send(account);
    },
  ),
  makeFastifyRoute(
    RouteMethod.GET,
    '/:id',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { id } = req.params as { id: BankingAccountId };
      const account = await getTreasuryAccountById(id, getOrganizationId(req));

      reply.status(account ? 200 : 404).send(account ?? { message: 'Treasury account not found' });
    },
  ),
  makeFastifyRoute(
    RouteMethod.PUT,
    '/:id',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { id } = req.params as { id: BankingAccountId };
      const body = req.body as Partial<BankingAccount>;
      const account = await updateTreasuryAccount(id, {
        ...body,
        organizationId: getOrganizationId(req),
        updatedBy: getUserId(req),
      });

      reply.status(account ? 200 : 404).send(account ?? { message: 'Treasury account not found' });
    },
  ),
  makeFastifyRoute(
    RouteMethod.DELETE,
    '/:id',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { id } = req.params as { id: BankingAccountId };
      const account = await softDeleteTreasuryAccount({
        accountId: id,
        organizationId: getOrganizationId(req),
        userId: getUserId(req),
      });

      reply.status(account ? 200 : 404).send(account ?? { message: 'Treasury account not found' });
    },
  ),
  makeFastifyRoute(
    RouteMethod.POST,
    '/:id/archive',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { id } = req.params as { id: BankingAccountId };
      const account = await archiveTreasuryAccount({
        accountId: id,
        organizationId: getOrganizationId(req),
        userId: getUserId(req),
      });

      reply.status(account ? 200 : 404).send(account ?? { message: 'Treasury account not found' });
    },
  ),
  makeFastifyRoute(
    RouteMethod.GET,
    '/:id/bank-movements',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { id } = req.params as { id: BankingAccountId };
      const query = (req.query ?? {}) as MovementListQuery;
      const movements = await getTreasuryMovements({
        organizationId: getOrganizationId(req),
        accountId: id,
        accountKind: 'bank',
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 100),
        search: query.search ?? '',
        reconciliationStatus: query.reconciliationStatus ?? 'all',
      });

      reply.status(200).send(movements);
    },
  ),
  makeFastifyRoute(
    RouteMethod.POST,
    '/:bankingAccountId/bank-movements',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { bankingAccountId } = req.params as { bankingAccountId: BankingAccountId };
      const body = req.body as Partial<TreasuryMovement>;
      const userId = getUserId(req);
      const movement = await createTreasuryMovement({
        ...body,
        bankingAccountId,
        accountKind: 'bank',
        organizationId: getOrganizationId(req),
        createdBy: userId,
        updatedBy: userId,
      });

      reply.status(201).send(movement);
    },
  ),
  makeFastifyRoute(
    RouteMethod.GET,
    '/:id/cash-movements',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { id } = req.params as { id: BankingAccountId };
      const query = (req.query ?? {}) as MovementListQuery;
      const movements = await getTreasuryMovements({
        organizationId: getOrganizationId(req),
        accountId: id,
        accountKind: 'cash',
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 100),
        search: query.search ?? '',
        reconciliationStatus: query.reconciliationStatus ?? 'all',
      });

      reply.status(200).send(movements);
    },
  ),
  makeFastifyRoute(
    RouteMethod.POST,
    '/:bankingAccountId/cash-movements',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { bankingAccountId } = req.params as { bankingAccountId: BankingAccountId };
      const body = req.body as Partial<TreasuryMovement>;
      const userId = getUserId(req);
      const movement = await createTreasuryMovement({
        ...body,
        bankingAccountId,
        accountKind: 'cash',
        organizationId: getOrganizationId(req),
        createdBy: userId,
        updatedBy: userId,
      });

      reply.status(201).send(movement);
    },
  ),
  makeFastifyRoute(
    RouteMethod.POST,
    '/:bankingAccountId/bank-movements/:movementId/reconcile',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const { bankingAccountId, movementId } = req.params as {
        bankingAccountId: BankingAccountId;
        movementId: TreasuryMovementId;
      };
      const movement = await reconcileTreasuryMovement({
        bankingAccountId,
        movementId,
        organizationId: getOrganizationId(req),
        userId: getUserId(req),
        data: req.body as Partial<TreasuryMovement>,
      });

      reply.status(movement ? 200 : 404).send(movement ?? { message: 'Treasury movement not found' });
    },
  ),
]);
