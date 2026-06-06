import { Logger, MonoContext } from '@hlb/kernel';
import mongoose from 'mongoose';
import { configureMongoose } from './id';

export interface InitMongooseOptions {
  mongoUri?: string;
}

export const initMongoose = async ({ mongoUri }: InitMongooseOptions) => {
  const logger = MonoContext.getStateValue('logger') as Logger;

  if (!mongoUri) {
    throw new Error('MongoDB URI is not provided');
  }
  configureMongoose();

  const connection = mongoose.connection;

  connection.on('error', (error: Error) => {
    logger.error(`Error in Mongoose connection: ${JSON.stringify(error)}`);
    throw new Error(JSON.stringify(error));
  });

  connection.on('connected', () => {
    logger.info(`Mongoose: Connected to ${connection.name}`);
  });

  connection.on('reconnectFailed', () => {
    logger.error('Mongoose: DB Connection Lost, retries failed');
  });

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  MonoContext.setState({
    dataSources: {
      ...(MonoContext.getState()['dataSources'] || {}),
      mongoose,
    },
  });
};
