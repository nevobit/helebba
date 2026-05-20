import Fastify, { type FastifyInstance } from 'fastify';
import type { BuildAppOpts } from './types';
import { genRequestIdFromHeaders } from '../adapters';
import { corsPlugin } from '../adapters/http/cors';
import { multipartPlugin } from '../adapters/http/multipart';
import { swaggerPlugin } from '../adapters/http/swagger';
import { verifyGatePlugin } from '../adapters/security/verify-gate';
import { notFoundPlugin } from '../adapters/errors/not-found';
import { tenancyPlugin } from '../adapters/tenancy';
import { errorHandlerPlugin } from '../adapters/errors/error-handler';
import { registerRoutes } from '../routes';
import { apiVersionHeadersHook } from '../adapters/versioning/api-version-headers';

export const buildApp = (opts: BuildAppOpts): FastifyInstance => {
  const environment = opts.environment ?? 'development';
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
