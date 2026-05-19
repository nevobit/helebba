import { model, Model, Schema } from 'mongoose';
import { Collection } from './constants';
import { MonoContext } from '@hlb/core-modules';

export const getModel = <T>(collectionName: Collection, schema: Schema): Model<T> => {
  const existing = model[collectionName] as Model<T> | undefined;
  return existing ?? model<T>(collectionName, schema, collectionName);
};   

export const getMongooseConnection = (): mongoose.Connection => {
  const dataSources = MonoContext.getState().dataSources as {
    mongoose?: typeof mongoose;
  };

  if (!dataSources?.mongoose?.connection) {
    throw new Error('Mongoose connection not found in MonoContext');
  }

  return dataSources.mongoose.connection;
};
