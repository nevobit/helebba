import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createServiceRoute } from './create';
import { deleteServiceRoute } from './delete';
import { getServiceRoute } from './get';
import { listServicesRoute } from './list';
import { updateServiceRoute } from './update';

export const serviceRoutes: RouteOptions[] = withPrefix('/services', [
  createServiceRoute,
  listServicesRoute,
  getServiceRoute,
  updateServiceRoute,
  deleteServiceRoute,
]);
