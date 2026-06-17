import { softDeleteWarehouse } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { type WarehouseId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const softDeleteWarehouseRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:warehouseId/delete',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { warehouseId } = req.params as { warehouseId: WarehouseId };
    const softDeletedWarehouse = await softDeleteWarehouse(warehouseId);
    reply.status(200).send(softDeletedWarehouse);
  },
);
