import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createProductRoute } from './create';
import { deleteProductRoute } from './delete';
import { updateProductRoute } from './update';
import { getProductByIdRoute } from './get-by-id';
import { softDeletePoductRoute } from './soft-delete';
import { getBySlugRoute } from './get-by-slug';

export const productRoutes: RouteOptions[] = withPrefix('/products', [
  createProductRoute,
  deleteProductRoute,
  softDeletePoductRoute,
  updateProductRoute,
  getProductByIdRoute,
  getBySlugRoute
]);
