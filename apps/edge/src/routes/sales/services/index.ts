import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createServiceRoute } from './create';
import { listServicesRoute } from './list';

export const serviceRoutes: RouteOptions[] = withPrefix('/services', [
  createServiceRoute,
  listServicesRoute,
]);
