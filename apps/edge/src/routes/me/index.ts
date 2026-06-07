import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { meOrganizationRoutes } from './organizations';

export const meRoutes: RouteOptions[] = withPrefix('/me', [...meOrganizationRoutes]);
