import { getAllPriceLists } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type PriceListQuery = {
  page?: string;
  limit?: string;
  search?: string;
};

export const listPriceListsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as PriceListQuery;
    const priceLists = await getAllPriceLists({
      organizationId: req.organization?.organizationId as OrganizationId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 100),
      search: query.search ?? '',
    });
    reply.status(200).send(priceLists);
  },
);