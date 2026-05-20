import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';
import type { FastifyPluginAsync } from 'fastify';
import { type BuildAppOpts } from '../../server/types';

const plugin: FastifyPluginAsync<BuildAppOpts> = async (app, opts) => {
  const environment = opts.environment ?? 'development';

  await app.register(fastifyCors, {
    origin:
      environment === 'development'
        ? true
        : [/\.dominio\.com$/, /^https:\/\/(www\.)?dominio\.com$/],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    ...(opts.corsOptions ?? {}),
  });
};

export const corsPlugin = fp<BuildAppOpts>(plugin, {
  name: 'cors-handler',
});
