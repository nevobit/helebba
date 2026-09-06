import { getCategoryById } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type CategoryId, type OrganizationId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getCategoryRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:categoryId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { categoryId } = req.params as { categoryId: CategoryId };
    const category = await getCategoryById(categoryId, req.organization.organizationId as OrganizationId);
    reply.status(200).send(category);
  },
);
