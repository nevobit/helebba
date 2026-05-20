import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyPluginAsync } from 'fastify';
import { type BuildAppOpts } from '../../server/types';

export const plugin: FastifyPluginAsync<BuildAppOpts> = async (app, opts) => {
  if (!opts.enableSwagger) return;

  if (opts.swaggerOptions) await app.register(fastifySwagger, opts.swaggerOptions);
  if (opts.swaggerUiOptions) await app.register(fastifySwaggerUi, opts.swaggerUiOptions);
};

export const swaggerPlugin = fp<BuildAppOpts>(plugin, {
  name: 'swagger',
});
