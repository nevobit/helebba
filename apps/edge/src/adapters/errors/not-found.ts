import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import * as os from 'node:os';
import { version, name } from '../../../package.json';
import { type BuildAppOpts } from '../../server/types';

const plugin: FastifyPluginAsync<BuildAppOpts> = async (app, opts) => {
  app.setNotFoundHandler((req, reply) => {
    const problem = {
      type: 'https://httpstatuses.com/404',
      title: 'Resource Not Found',
      status: 404,
      detail: `No resource found for ${req.method} ${req.url}`,
      instance: req.url,
      method: req.method,
      requestId: req.id,
      service: {
        name,
        version,
        host: os.hostname(),
        env: opts.environment ?? process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
      hints: [
        'Check that the route is correct',
        'Make sure to use the /api/v1 prefix if applicable',
      ],
      docs: 'https://api.keystone.app/docs',
    };

    reply.code(404).type('application/problem+json').send(problem);
  });
};

export const notFoundPlugin = fp(plugin, {
  name: 'not-found-handler',
});
