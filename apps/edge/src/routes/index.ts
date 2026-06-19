import type { FastifyInstance, RouteOptions } from 'fastify';
import { opsRoutes } from './ops';
import { contactRoutes } from './contacts';
import { warehouseRoutes } from './inventory/warehouses';
import { productRoutes } from './inventory/products';
import { categoryRoutes } from './inventory/categories';
import { brandRoutes } from './inventory/brands';
import { meRoutes } from './me';
import { accessRoutes } from './access';
import { roleRoutes } from './roles';
import { subscriptionRoutes } from './subscriptions';
import { serviceRoutes } from './sales/services';
import { estimateRoutes, invoiceRoutes, purchaseRoutes } from './sales/documents';
import { paymentMethodRoutes } from './treasury/payment-methods';
import { treasuryAccountRoutes } from './treasury/accounts';
import { paymentRoutes } from './accounting/payments';
import { mediaRoutes } from './media';

const routes: RouteOptions[] = [
  ...opsRoutes,
  ...accessRoutes,
  ...productRoutes,
  ...categoryRoutes,
  ...brandRoutes,
  ...contactRoutes,
  ...warehouseRoutes,
  ...meRoutes,
  ...roleRoutes,
  ...subscriptionRoutes,
  ...serviceRoutes,
  ...invoiceRoutes,
  ...estimateRoutes,
  ...purchaseRoutes,
  ...paymentMethodRoutes,
  ...treasuryAccountRoutes,
  ...paymentRoutes,
  ...mediaRoutes,
];

export const registerRoutes = (app: FastifyInstance) => {
  routes.map((route) => app.route(route));
};
