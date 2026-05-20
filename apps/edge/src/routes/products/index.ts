import type { RouteOptions } from 'fastify';
import { withPrefix } from '@hlb/constant-definitions';
import { createCustomerRoute } from './create';
import { getAllCustomersRoute } from './list';

export const productRoutes: RouteOptions[] = withPrefix('/products', [createProductRoute]);
