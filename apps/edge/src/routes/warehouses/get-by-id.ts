import { getWarehouseById } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { WarehouseId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const getWarehouseByIdRoute = makeFastifyRoute(
    RouteMethod.GET,
    '/:warehouseId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {warehouseId} = req.params as {warehouseId: WarehouseId};
        const getedWarehouseById = await getWarehouseById(warehouseId);
        reply.status(200).send(getedWarehouseById);
    }
)