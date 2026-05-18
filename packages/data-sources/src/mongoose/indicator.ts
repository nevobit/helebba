import { performance } from 'node:perf_hooks';
import type { HealthIndicator } from '@hlb/contracts';

export interface MongooseConnectionLike {
  readonly readyState: number;
  readonly db?: {
    admin: () => {
      ping: () => Promise<unknown>;
    };
  };
}

export interface MongooseIndicatorOptions {
  readonly connection: MongooseConnectionLike;
  readonly name?: string;
  readonly critical?: boolean;
}

export const createMongooseHealthIndicator = (
  options: MongooseIndicatorOptions,
): HealthIndicator => {
  const name = options.name ?? 'mongodb';
  const critical = options.critical ?? true;

  return {
    name,
    critical,
    check: async () => {
      const startedAt = performance.now();

      try {
        if (options.connection.readyState !== 1) {
          throw new Error(`Mongo not connected (state: ${options.connection.readyState})`);
        }

        await options.connection.db?.admin().ping();

        const latencyMs = Math.round(performance.now() - startedAt);

        return {
          name,
          critical,
          status: 'ok',
          latencyMs,
        } as const;
      } catch (error) {
        const latencyMs = Math.round(performance.now() - startedAt);

        return {
          name,
          critical,
          status: 'error',
          latencyMs,
          message: error instanceof Error ? error.message : 'Unknown error',
        } as const;
      }
    },
  };
};
