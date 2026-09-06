import type { RouteOptions } from 'fastify';
import { getTreasuryMovements } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import type { OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type TransactionQuery = {
  page?: string;
  limit?: string;
  search?: string;
  reconciliationStatus?: string;
};

const routes: RouteOptions[] = [
  makeFastifyRoute(
    RouteMethod.GET,
    '/transactions',
    verifyJwt,
    { organization: 'required', auth: 'required' },
    async (req, reply) => {
      const query = (req.query ?? {}) as TransactionQuery;
      reply.status(200).send(await getTreasuryMovements({
        organizationId: req.organization.organizationId as OrganizationId,
        page: Number(query.page ?? 1),
        limit: Number(query.limit ?? 100),
        search: query.search ?? '',
        reconciliationStatus: query.reconciliationStatus ?? 'all',
      }));
    },
  ),
];

export const treasuryCompatibilityRoutes = withPrefix('/treasury', routes);
