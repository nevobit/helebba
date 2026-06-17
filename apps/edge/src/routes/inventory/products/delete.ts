import { deleteProduct } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { type ProductId } from "@hlb/contracts";
import { verifyJwt } from '@hlb/security';

export const deleteProductRoute = makeFastifyRoute(
    RouteMethod.DELETE,
    '/:productId',
    verifyJwt,
    {organization: 'required', auth: 'required'},
    async (req, reply) => {
        const {productId} = req.params as {productId: ProductId};
        const product = await deleteProduct(productId);
        reply.status(200).send(product)
    }

)