import type fastifyCors from '@fastify/cors';
import type fastifySwagger from '@fastify/swagger';
import type fastifySwaggerUi from '@fastify/swagger-ui';
import type { Logger } from '@hlb/kernel';

export type SwaggerOpts = Parameters<typeof fastifySwagger>[1];
export type SwaggerUiOpts = Parameters<typeof fastifySwaggerUi>[1];
export type CorsOpts = Parameters<typeof fastifyCors>[1];

export type ReadinessResult = {
  ok: boolean;
  details?: Record<string, unknown>;
};

export type Environment = 'dev' | 'stg' | 'prod';

export interface BuildAppOpts {
  logger?: Logger;

  environment?: Environment;
  trustProxy?: boolean;

  enableSwagger?: boolean;
  swaggerOptions?: SwaggerOpts;
  swaggerUiOptions?: SwaggerUiOpts;
  corsOptions?: CorsOpts;
  readiness?: () => Promise<ReadinessResult>;

  baseDomain?: string;
  pathPrefix?: string;
  apiPrefix?: string;
  tenantHeaderName?: string;
  reservedSubdomains?: string[];
}
