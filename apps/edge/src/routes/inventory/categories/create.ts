import { createCategory } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type Category, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const createCategoryRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<Category>;
    const { userId } = req.auth as unknown as { userId: UserId };
    const category = await createCategory({
      ...body,
      organizationId: req.organization?.organizationId as OrganizationId,
      createdBy: userId,
      updatedBy: userId,
    });

    reply.status(201).send(category);
  },
);
