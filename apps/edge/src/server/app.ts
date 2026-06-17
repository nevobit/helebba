import Fastify, { type FastifyInstance } from 'fastify';
import type { BuildAppOpts } from './types';
import {
  genRequestIdFromHeaders,
  corsPlugin,
  multipartPlugin,
  swaggerPlugin,
  verifyGatePlugin,
  notFoundPlugin,
  tenancyPlugin,
  errorHandlerPlugin,
  apiVersionHeadersHook,
} from '../adapters';
import { registerRoutes } from '../routes';

export const buildApp = (opts: BuildAppOpts): FastifyInstance => {
  const environment = opts.environment ?? 'dev';
  const trustProxy = opts.trustProxy ?? environment === 'prod';

  const app = Fastify({
    logger: false,
    trustProxy,
    genReqId: (req) => genRequestIdFromHeaders(req.headers as Record<string, unknown>),
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true,
        allErrors: false,
      },
    },
    requestTimeout: 60_000,
    connectionTimeout: 10_000,
    bodyLimit: 2 * 1024 * 1024,
  });

  app.addHook('onRequest', apiVersionHeadersHook);

  app.register(corsPlugin, opts);
  app.register(multipartPlugin);
  app.register(swaggerPlugin, opts);

  app.register(tenancyPlugin, opts);
  app.register(verifyGatePlugin, opts);

  app.register(notFoundPlugin, opts);
  app.register(errorHandlerPlugin, opts);

  app.register(registerRoutes, { prefix: opts.pathPrefix });

  return app;
};
