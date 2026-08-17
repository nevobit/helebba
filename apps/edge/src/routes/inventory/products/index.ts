import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createProductRoute } from './create';
import { deleteProductRoute } from './delete';
import { updateProductRoute } from './update';
import { getProductByIdRoute } from './get-by-id';
import { getBySlugRoute } from './get-by-slug';
import { getAllProductsRoute } from './list';

export const productRoutes: RouteOptions[] = withPrefix('/products', [
  createProductRoute,
  deleteProductRoute,
  updateProductRoute,
  getProductByIdRoute,
  getBySlugRoute,
  getAllProductsRoute,
]);
