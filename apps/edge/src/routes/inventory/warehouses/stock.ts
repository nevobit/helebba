import { listInventoryStock } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { OrganizationId, WarehouseId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';

export const getWarehouseStockRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/:warehouseId/stock',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { warehouseId } = req.params as { warehouseId: WarehouseId };
    reply.send(await listInventoryStock(req.organization!.organizationId as OrganizationId, warehouseId));
  },
);
