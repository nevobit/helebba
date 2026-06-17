import { Collection, getModel } from '@hlb/constant-definitions';
import { type User, UserSchemaMongo } from '@hlb/contracts';

export const createUser = async (user: Partial<User>) => {
  const model = getModel<User>(Collection.USERS, UserSchemaMongo);
  const newUser = await model.create(user);
  return newUser;
};
