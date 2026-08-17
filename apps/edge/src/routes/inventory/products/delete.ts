import { deleteProduct } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteProductRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:productId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId } = req.params as { productId: ProductId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const deleted = await deleteProduct(
      productId,
      req.organization?.organizationId as OrganizationId,
      userId,
    );
    reply.status(200).send(deleted);
  },
);
