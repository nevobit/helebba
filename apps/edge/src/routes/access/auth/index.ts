import { withPrefix } from '@hlb/constant-definitions';
import { RouteOptions } from 'fastify';
import { loginRoute } from './login';
import { switchOrganizationRoute } from './login-organization';

export const authRoutes: RouteOptions[] = withPrefix('/auth', [
  loginRoute,
  switchOrganizationRoute,
]);
