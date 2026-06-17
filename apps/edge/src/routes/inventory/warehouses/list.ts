import { getAllWarehouses } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type WarehouseListQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

export const listWarehousesRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as WarehouseListQuery;
    const warehouses = await getAllWarehouses({
      organizationId: req.organization?.organizationId as OrganizationId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 100),
      search: query.search ?? '',
    });

    reply.status(200).send(warehouses);
  },
);
