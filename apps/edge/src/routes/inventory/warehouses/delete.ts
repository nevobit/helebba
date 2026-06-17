import { deleteWarehouse } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { type WarehouseId } from "@hlb/contracts";
import { verifyJwt } from '@hlb/security';

export const deleteWarehouseRoute = makeFastifyRoute(
    RouteMethod.DELETE,
    '/:warehouseId',
    verifyJwt,
    {organization: 'required', auth: 'required'},
    async (req, reply) => {
        const {warehouseId} = req.params as {warehouseId: WarehouseId};
        const deletedWarehouse = await deleteWarehouse(warehouseId);
        reply.status(200).send(deletedWarehouse);
    }
)
