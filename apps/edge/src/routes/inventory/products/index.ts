import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createProductRoute } from './create';
import { deleteProductRoute } from './delete';
import { updateProductRoute } from './update';
import { getProductByIdRoute } from './get-by-id';
import { getBySlugRoute } from './get-by-slug';
import { getAllProductsRoute } from './list';
import { getProductStatsRoute } from './stats';
import { getInventoryDashboardRoute } from './dashboard';
import { getInventoryAnalyticsRoute } from './inventory-analytics';
import { productCompatibilityRoutes } from './compatibility';

export const productRoutes: RouteOptions[] = withPrefix('/products', [
  getInventoryDashboardRoute,
  getInventoryAnalyticsRoute,
  ...productCompatibilityRoutes,
  createProductRoute,
  deleteProductRoute,
  updateProductRoute,
  getProductByIdRoute,
  getBySlugRoute,
  getAllProductsRoute,
  getProductStatsRoute,
]);
