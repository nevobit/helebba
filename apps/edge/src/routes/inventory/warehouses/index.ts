import { withPrefix } from '@hlb/constant-definitions';
import type { RouteOptions } from 'fastify';
import { createWarehouseRoute } from './create';
import { deleteWarehouseRoute } from './delete';
import { getWarehouseByIdRoute } from './get-by-id';
import { listWarehousesRoute } from './list';
import { softDeleteWarehouseRoute } from './soft-delete';
import { updateWarehouseRoute } from './update';

export const warehouseRoutes: RouteOptions[] = withPrefix('/warehouses', [
    createWarehouseRoute,
    listWarehousesRoute,
    updateWarehouseRoute,
    deleteWarehouseRoute,
    softDeleteWarehouseRoute,
    getWarehouseByIdRoute
]);
