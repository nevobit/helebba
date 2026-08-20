import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createPriceListRoute } from './create';
import { listPriceListsRoute } from './list';

export const priceListRoutes: RouteOptions[] = withPrefix('/price-lists', [
  createPriceListRoute,
  listPriceListsRoute,
]);