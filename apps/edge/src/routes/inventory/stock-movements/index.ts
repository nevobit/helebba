import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createStockMovementRoute } from './create';
import { listStockMovementsRoute } from './list';

export const stockMovementRoutes: RouteOptions[] = withPrefix('/products', [
  createStockMovementRoute,
  listStockMovementRoutes,
]);