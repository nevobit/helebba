import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createBrandRoute } from './create';
import { listBrandsRoute } from './list';
import { deleteBrandRoute } from './delete';
import { getBrandRoute } from './get';
import { updateBrandRoute } from './update';

export const brandRoutes: RouteOptions[] = withPrefix('/brands', [
  createBrandRoute,
  listBrandsRoute,
  getBrandRoute,
  updateBrandRoute,
  deleteBrandRoute,
]);
