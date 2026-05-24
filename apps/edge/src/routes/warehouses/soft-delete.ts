import { softDeleteWarehouse } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { WarehouseId } from "@hlb/contracts";
import { verifyAccessToken } from '@hlb/security';

export const softDeleteWarehouseRoute = makeFastifyRoute(
    RouteMethod.PATCH,
    '/:warehouseId',
    verifyAccessToken,
    {tenant: 'required', auth: 'required'},
    async (req, reply) => {
        const {warehouseId} = req.params as {warehouseId: WarehouseId};
        const softDeletedWarehouse = await softDeleteWarehouse(warehouseId)
        reply.status(200).send(softDeletedWarehouse);
    }
)