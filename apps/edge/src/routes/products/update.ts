import { updateProduct } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { Product, ProductId } from '@hlb/contracts';
import { verifyAccessToken } from '@hlb/security';

export const updateProductRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:productId',
  verifyAccessToken,
  { tenant: 'required', auth: 'required' },
  async (req, reply) => {
    const body = req.body as Partial<Product>;
    const { productId } = req.params as { productId: ProductId };
    const updatedProduct = await updateProduct(productId, body);
    reply.status(200).send(updatedProduct);
  },
);
