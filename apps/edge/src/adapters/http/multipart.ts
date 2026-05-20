import fp from 'fastify-plugin';
import fastifyMultipart from '@fastify/multipart';
import type { FastifyPluginAsync } from 'fastify';

const plugin: FastifyPluginAsync = fp(async (app) => {
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 5,
      fields: 50,
      fieldSize: 1024 * 1024,
    },
  });
});

export const multipartPlugin = fp(plugin, {
  name: 'multipart-handler',
});
