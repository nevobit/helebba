import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createProductNoteRoute } from './create';
import { listProductNotesRoute } from './list';
import { deleteProductNoteRoute } from './delete';

export const productNoteRoutes: RouteOptions[] = withPrefix('/products', [
  createProductNoteRoute,
  listProductNotesRoute,
  deleteProductNoteRoute,
]);