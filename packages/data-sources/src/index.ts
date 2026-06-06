import { type InitMongooseOptions, initMongoose } from './mongoose';

export interface InitDataSourcesOptions {
  mongoose?: InitMongooseOptions;
}

export const initDataSources = async ({ mongoose /*redisdb*/ }: InitDataSourcesOptions) => {
  if (mongoose) {
    await initMongoose(mongoose);
  }
};

export { createMongooseHealthIndicator } from './mongoose';
