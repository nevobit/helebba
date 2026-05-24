import { getProductById } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { ProductId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const getProductByIdRoute = makeFastifyRoute(
    RouteMethod.GET,
    '/:productId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {productId} = req.params as {productId: ProductId};
        const getedProductById = await getProductById(productId);
        reply.status(200).send(getedProductById);
    }
)