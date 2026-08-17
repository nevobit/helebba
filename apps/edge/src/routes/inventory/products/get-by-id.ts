import { getProductById } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type ProductId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getProductByIdRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:productId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { productId } = req.params as { productId: ProductId };
    const product = await getProductById(productId, req.organization?.organizationId as OrganizationId);
    if (!product) return reply.status(404).send({ message: 'Producto no encontrado.' });
    reply.status(200).send(product);
  },
);
