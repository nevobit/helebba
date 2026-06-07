import type { RouteOptions } from 'fastify';
import { authRoutes } from './auth';

export const accessRoutes: RouteOptions[] = [...authRoutes];
