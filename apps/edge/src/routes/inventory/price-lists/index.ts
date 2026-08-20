import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createPriceListRoute } from './create';
import { listPriceListsRoute } from './list';
import { updatePriceListRoute } from './update';

export const priceListRoutes: RouteOptions[] = withPrefix('/price-lists', [
  createPriceListRoute,
  listPriceListsRoute,
  updatePriceListRoute,
]);