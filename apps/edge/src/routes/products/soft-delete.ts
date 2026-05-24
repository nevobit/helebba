import { softDeleteProduct } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { ProductId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const softDeletePoductRoute = makeFastifyRoute(
    RouteMethod.PATCH,
    '/:productId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {productId} = req.params as {productId: ProductId};
        const softDeletedProduct = await softDeleteProduct(productId);
        reply.status(200).send(softDeletedProduct)
    }
)