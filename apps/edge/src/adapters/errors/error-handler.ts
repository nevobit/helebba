import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import type { BuildAppOpts } from '../../server/types';
import { getPathname } from '../observability';
import { asError, getStatusCode } from '@hlb/kernel';

const plugin: FastifyPluginAsync<BuildAppOpts> = async (app, opts) => {
  const environment = opts.environment ?? 'development';

  app.setErrorHandler((error, req, reply) => {
    const err = asError(error);
    const status = getStatusCode(err);

    opts.logger?.error('Unhandled error', {
      requestId: req.id,
      status,
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    reply
      .code(status)
      .type('application/json')
      .send({
        type: 'about:blank',
        title: status >= 500 ? 'Internal Server Error' : err.name || 'Bad Request',
        status,
        detail: environment === 'development' ? err.message : undefined,
        instance: getPathname(req.url),
        requestId: req.id,
      });
  });
};

export const errorHandlerPlugin = fp<BuildAppOpts>(plugin, {
  name: 'error-handler',
});
