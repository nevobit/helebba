import { updateCategory } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type Category, type CategoryId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateCategoryRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:categoryId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { categoryId } = req.params as { categoryId: CategoryId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const category = await updateCategory(
      categoryId,
      req.organization?.organizationId as OrganizationId,
      { ...(req.body as Partial<Category>), updatedBy: userId },
    );
    reply.status(200).send(category);
  },
);
