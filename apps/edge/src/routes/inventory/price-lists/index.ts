import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createPriceListRoute } from './create';
import { deletePriceListRoute } from './delete';
import { getPriceListRoute } from './get';
import { listPriceListsRoute } from './list';
import { updatePriceListRoute } from './update';

export const priceListRoutes: RouteOptions[] = withPrefix('/price-lists', [
  createPriceListRoute,
  listPriceListsRoute,
  getPriceListRoute,
  updatePriceListRoute,
  deletePriceListRoute,
]);
