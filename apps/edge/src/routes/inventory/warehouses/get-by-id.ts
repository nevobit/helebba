import { getWarehouseById } from "@hlb/business-logic";
import { makeFastifyRoute, RouteMethod } from "@hlb/constant-definitions";
import { type OrganizationId, type WarehouseId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getWarehouseByIdRoute = makeFastifyRoute(
    RouteMethod.GET,
    '/:warehouseId',
    verifyJwt,
    {organization: 'required', auth: 'required'},
    async (req, reply) => {
        const {warehouseId} = req.params as {warehouseId: WarehouseId};
        const getedWarehouseById = await getWarehouseById(
          warehouseId,
          req.organization!.organizationId as OrganizationId,
        );
        if (!getedWarehouseById) return reply.status(404).send({ message: 'Warehouse not found' });
        reply.status(200).send(getedWarehouseById);
    }
)
