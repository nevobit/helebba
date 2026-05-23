import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createProductRoute } from './create';
import { deleteProductRoute } from './delete';
import { updateProductRoute } from './update';

export const productRoutes: RouteOptions[] = withPrefix('/products', [
  createProductRoute,
  deleteProductRoute,
  updateProductRoute,
]);
