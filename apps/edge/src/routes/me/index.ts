import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { meOrganizationRoutes } from './organizations';
import { meUserRoutes } from './users';
import { meApiKeyRoutes } from './api-keys';

export const meRoutes: RouteOptions[] = withPrefix('/me', [
  ...meOrganizationRoutes,
  ...meUserRoutes,
  ...meApiKeyRoutes,
]);
