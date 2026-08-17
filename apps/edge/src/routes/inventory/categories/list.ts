import { getAllCategories } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type CategoryId, type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type CategoryListQuery = {
  page?: string;
  limit?: string;
  search?: string;
  parentId?: string;
};

export const listCategoriesRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as CategoryListQuery;
    const categories = await getAllCategories({
      organizationId: req.organization?.organizationId as OrganizationId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 100),
      search: query.search ?? '',
      parentId: query.parentId === 'root' ? null : (query.parentId as CategoryId | undefined),
    });

    reply.status(200).send(categories);
  },
);
