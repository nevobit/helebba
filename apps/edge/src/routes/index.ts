import type { FastifyInstance, RouteOptions } from 'fastify';
import { opsRoutes } from './ops';
import { withPrefix } from '@hlb/constant-definitions';
import { contactRoutes } from './contacts';

const routes: RouteOptions[] = [...opsRoutes, ...productRoutes, ...contactRoutes];

export const registerRoutes = (app: FastifyInstance) => {
  routes.map((route) => app.route(route));
};
