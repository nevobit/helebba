import type { HealthIndicator } from '@hlb/contracts';
import { getPostgresqlClient, getMongooseConnection } from '@hlb/constant-definitions';
import { createMongooseHealthIndicator, createPostgresHealthIndicator } from '@hlb/data-sources';
// import { redisIndicator } from "./indicators/redis.indicator";
// import { mongoIndicator } from "./indicators/mongo.indicator";

export const getHealthIndicators = (): HealthIndicator[] => {
  const db = getPostgresqlClient();
  const mongoDb = getMongooseConnection();
  const postgresIndicator = createPostgresHealthIndicator({
    db,
    critical: false,
  });
  const mongoIndicator = createMongooseHealthIndicator({
    connection: mongoDb,
    critical: false,
  });

  return [
    postgresIndicator,
    // redisIndicator,
    mongoIndicator,
  ];
};
