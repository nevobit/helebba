import { withPrefix } from "@hlb/constant-definitions";
import { RouteOptions } from "fastify";
import { createWarehouseRoute } from "./create";

export const warehouseRoutes: RouteOptions[] = withPrefix('/warehouse', [createWarehouseRoute]);