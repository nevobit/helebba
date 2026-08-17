import { updateProduct } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type Product, type ProductId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateProductRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:productId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<Product>;
    const { productId } = req.params as { productId: ProductId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const updatedProduct = await updateProduct(
      productId,
      req.organization?.organizationId as OrganizationId,
      { ...body, updatedBy: userId },
    );
    reply.status(200).send(updatedProduct);
  },
);
