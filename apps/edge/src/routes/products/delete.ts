import { deleteProduct } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { ProductId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const deleteProductRoute = makeFastifyRoute(
    RouteMethod.DELETE,
    '/:productId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {productId} = req.params as {productId: ProductId};
        const product = await deleteProduct(productId);
        reply.status(200).send(product)
    }

)