import { type InitMongooseOptions, initMongoose } from './mongoose';
import { initRedis, InitRedisOptions } from './redis';

export interface InitDataSourcesOptions {
  mongoose?: InitMongooseOptions;
  redisdb?: InitRedisOptions;
}

export const initDataSources = async ({ mongoose, redisdb }: InitDataSourcesOptions) => {
  if (mongoose) {
    await initMongoose(mongoose);
  }

  if (redisdb) {
    await initRedis(redisdb);
  }
};

export { createMongooseHealthIndicator } from './mongoose';
