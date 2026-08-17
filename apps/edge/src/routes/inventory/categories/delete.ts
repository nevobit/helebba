import { deleteCategory } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type CategoryId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteCategoryRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:categoryId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { categoryId } = req.params as { categoryId: CategoryId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const deleted = await deleteCategory(
      categoryId,
      req.organization?.organizationId as OrganizationId,
      userId,
    );
    reply.status(200).send(deleted);
  },
);
