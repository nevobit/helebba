import { listProductFieldDefinitions } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { CategoryId, OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

type ListQuery = {
  categoryId?: string;
  categoryIds?: string;
  includeInactive?: string;
  target?: 'product' | 'variant';
};

export const listProductFieldDefinitionsRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const query = (req.query ?? {}) as ListQuery;
    const definitions = await listProductFieldDefinitions({
      organizationId: req.organization?.organizationId as OrganizationId,
      categoryId: query.categoryId as CategoryId | undefined,
      categoryIds: query.categoryIds?.split(',').filter(Boolean) as CategoryId[] | undefined,
      includeInactive: query.includeInactive === 'true',
      target: query.target,
    });

    return reply.status(200).send(definitions);
  },
);
