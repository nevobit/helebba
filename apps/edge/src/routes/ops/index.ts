import type { RouteOptions } from 'fastify';
import { healthRoute } from './health';
import { liveRoute } from './live';
import { readyRoute } from './ready';
import { metricsRoute } from './metrics';

export const opsRoutes: RouteOptions[] = [
    liveRoute, 
    readyRoute,
    healthRoute, 
    metricsRoute
];
