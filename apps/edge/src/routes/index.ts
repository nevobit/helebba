import type { FastifyInstance, RouteOptions } from 'fastify';
import { opsRoutes } from './ops';
import { withPrefix } from '@hlb/constant-definitions';

const routes: RouteOptions[] = [...opsRoutes, ...productRoutes];

export const registerRoutes = (app: FastifyInstance) => {
  routes.map((route) => app.route(route));
};
