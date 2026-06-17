import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createBrandRoute } from './create';
import { listBrandsRoute } from './list';

export const brandRoutes: RouteOptions[] = withPrefix('/brands', [
  createBrandRoute,
  listBrandsRoute,
]);
