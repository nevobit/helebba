import type { HealthIndicator } from '@hlb/contracts';
import { getMongooseConnection } from '@hlb/constant-definitions';
import { createMongooseHealthIndicator } from '@hlb/data-sources';
// import { redisIndicator } from "./indicators/redis.indicator";
// import { mongoIndicator } from "./indicators/mongo.indicator";

export const getHealthIndicators = (): HealthIndicator[] => {
  const mongoDb = getMongooseConnection();
  const mongoIndicator = createMongooseHealthIndicator({
    connection: mongoDb,
    critical: false,
  });

  return [
    // redisIndicator,
    mongoIndicator,
  ];
};
