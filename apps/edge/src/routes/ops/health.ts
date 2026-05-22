import type { RouteOptions } from 'fastify';
import { getServiceMeta } from '../../adapters';
import { deriveHealthStatus, evaluateReadiness } from '../../adapters/ops/readiness';
import { getHealthIndicators } from '../../adapters/ops/health-indicators';

export const healthRoute: RouteOptions = {
  method: 'GET',
  url: '/health',
  handler: async (request, reply) => {
    const evaluation = await evaluateReadiness(getHealthIndicators());
    const status = deriveHealthStatus(evaluation.dependencies);

    return reply.status(200).send({
      status: status,
      service: getServiceMeta(),
      dependencies: evaluation.dependencies,
      requestId: request.id,
    });
  },
};
