import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { listMyOrganizationsRoute } from './list';

export const meOrganizationRoutes: RouteOptions[] = withPrefix('/organizations', [
  listMyOrganizationsRoute,
]);
