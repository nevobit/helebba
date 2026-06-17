import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createCategoryRoute } from './create';
import { listCategoriesRoute } from './list';

export const categoryRoutes: RouteOptions[] = withPrefix('/categories', [
  createCategoryRoute,
  listCategoriesRoute,
]);
