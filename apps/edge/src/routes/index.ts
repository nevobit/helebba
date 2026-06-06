import type { FastifyInstance, RouteOptions } from 'fastify';
import { opsRoutes } from './ops';
import { withPrefix } from '@hlb/constant-definitions';
import { contactRoutes } from './contacts';
import { warehouseRoutes } from './warehouses';
import { productRoutes } from './products';
import { authRoutes } from './access/auth';

const routes: RouteOptions[] = [
  ...opsRoutes,
  ...productRoutes,
  ...contactRoutes,
  ...warehouseRoutes,
  ...authRoutes,
];

export const registerRoutes = (app: FastifyInstance) => {
  routes.map((route) => app.route(route));
};
