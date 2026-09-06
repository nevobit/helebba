import { deleteWarehouse } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { type OrganizationId, type UserId, type WarehouseId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const deleteWarehouseRoute = makeFastifyRoute(
    RouteMethod.DELETE,
    '/:warehouseId',
    verifyJwt,
    {organization: 'required', auth: 'required'},
    async (req, reply) => {
        const {warehouseId} = req.params as {warehouseId: WarehouseId};
        const { userId } = req.auth as unknown as { userId: UserId };
        const deletedWarehouse = await deleteWarehouse(
          warehouseId,
          req.organization!.organizationId as OrganizationId,
          userId,
        );
        reply.status(200).send(deletedWarehouse);
    }
)
