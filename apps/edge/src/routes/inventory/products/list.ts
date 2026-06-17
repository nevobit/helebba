import { getAllProducts } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type ProductListQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

export const getAllProductsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (request, reply) => {
    const query = (request.query ?? {}) as ProductListQuery;
    const products = await getAllProducts({
      organizationId: request.organization!.organizationId as OrganizationId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 100),
      search: query.search ?? '',
    });

    return reply.status(200).send(products);
  },
);
