import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createProductFieldDefinitionRoute } from './create';
import { listProductFieldDefinitionsRoute } from './list';
import { removeProductFieldDefinitionRoute } from './remove';
import { updateProductFieldDefinitionRoute } from './update';

export const productFieldDefinitionRoutes: RouteOptions[] = withPrefix('/product-field-definitions', [
  createProductFieldDefinitionRoute,
  listProductFieldDefinitionsRoute,
  updateProductFieldDefinitionRoute,
  removeProductFieldDefinitionRoute,
]);
