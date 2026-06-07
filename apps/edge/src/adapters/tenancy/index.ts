import fp from 'fastify-plugin';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { type BuildAppOpts } from '../../server/types';
import { assertTenantContext, resolveTenantContext } from '@hlb/security';
import path from 'path';

declare module 'fastify' {
  interface FastifyRequest {
    orgnanization: ReturnType<typeof resolveTenantContext> | null;
  }

  interface FastifyInstance {
    requireTenant: (req: FastifyRequest) => Promise<void>;
  }
}

export const plugin: FastifyPluginAsync<BuildAppOpts> = async (app, opts) => {
  const baseDomain = opts.baseDomain ?? process.env.BASE_DOMAIN ?? 'app.helebba.com';
  const pathPrefix = opts.pathPrefix ?? '/w';
  const apiPrefix = opts.apiPrefix ?? '/api/v1';
  const tenantHeaderName = opts.tenantHeaderName ?? 'x-tenant';
  const reservedSubdomains = opts.reservedSubdomains ?? ['www', 'api', 'admin', 'docs'];

  app.decorateRequest('orgnanization', null);

  app.addHook('onRequest', async (req) => {
    const orgnanization = resolveTenantContext({
      baseDomain,
      pathPrefix,
      apiPrefix,
      allowPathMode: true,
      allowHeaderMode: true,
      allowHostMode: true,
      tenantHeaderName,
      reservedSubdomains,
    });

    req.orgnanization = orgnanization;

    if ((opts.environment ?? 'dev') !== 'prod') {
      opts.logger?.debug('Tenant resolved', {
        requestId: req.id,
        source: orgnanization.source,
        tenantSlug: orgnanization.tenantSlug,
        method: req.method,
        path: req.url,
        url: req.url,
        ip: req.ip,
      });
    }
  });

  app.decorate('requireTenant', async (req: FastifyRequest) => {
    assertTenantContext(req.orgnanization!, 'Tenant is required for this route');
  });
};

export const tenancyPlugin = fp(plugin, {
  name: 'tenancy',
});
