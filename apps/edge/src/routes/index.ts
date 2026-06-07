import type { FastifyInstance, RouteOptions } from 'fastify';
import { opsRoutes } from './ops';
import { contactRoutes } from './contacts';
import { warehouseRoutes } from './warehouses';
import { productRoutes } from './products';
import { authRoutes } from './access/auth';
import { meRoutes } from './me';
import { accessRoutes } from './access';

const routes: RouteOptions[] = [
  ...opsRoutes,
  ...productRoutes,
  ...contactRoutes,
  ...warehouseRoutes,
  ...accessRoutes,
  ...meRoutes,
];

export const registerRoutes = (app: FastifyInstance) => {
  routes.map((route) => app.route(route));
};
