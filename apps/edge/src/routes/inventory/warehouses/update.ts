import { updateWarehouse } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type OrganizationId, type UserId, type Warehouse, type WarehouseId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const updateWarehouseRoute = makeFastifyRoute(
  RouteMethod.PATCH,
  '/:warehouseId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { warehouseId } = req.params as { warehouseId: WarehouseId };
    const { userId } = req.auth as unknown as { userId: UserId };
    const warehouse = await updateWarehouse(
      warehouseId,
      req.organization!.organizationId as OrganizationId,
      userId,
      req.body as Partial<Warehouse>,
    );
    reply.status(200).send(warehouse);
  },
);
