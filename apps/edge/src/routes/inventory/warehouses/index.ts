import { withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';
import { createWarehouseRoute } from './create';
import { deleteWarehouseRoute } from './delete';
import { getWarehouseByIdRoute } from './get-by-id';
import { listWarehousesRoute } from './list';
import { softDeleteWarehouseRoute } from './soft-delete';
import { updateWarehouseRoute } from './update';
import { getWarehouseStockRoute } from './stock';

export const warehouseRoutes: RouteOptions[] = withPrefix('/warehouses', [
    createWarehouseRoute,
    listWarehousesRoute,
    getWarehouseStockRoute,
    updateWarehouseRoute,
    deleteWarehouseRoute,
    softDeleteWarehouseRoute,
    getWarehouseByIdRoute
]);
