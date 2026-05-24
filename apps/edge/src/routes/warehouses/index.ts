import { withPrefix } from "@hlb/constant-definitions";
import { RouteOptions } from "fastify";
import { createWarehouseRoute } from "./create";
import { updateWarehouseRoute } from "./update";
import { deleteWarehouseRoute } from "./delete";
import { softDeleteWarehouseRoute } from "./soft-delete";
import { getWarehouseByIdRoute } from "./get-by-id";

export const warehouseRoutes: RouteOptions[] = withPrefix('/warehouse', [
    createWarehouseRoute,
    updateWarehouseRoute,
    deleteWarehouseRoute,
    softDeleteWarehouseRoute,
    getWarehouseByIdRoute
]);