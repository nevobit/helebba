import { Collection, getModel } from '@hlb/constant-definitions';
import { UserSchemaMongo, type User } from '@hlb/contracts';

export const findByEmail = async (email: string) => {
  const model = getModel<User>(Collection.USERS, UserSchemaMongo);
  const user = await model.findOne({ email });
  if (!user) throw new Error('User not found');
  return user;
};

export const findByEmailOrNull = async (email: string): Promise<User | null> => {
  const model = getModel<User>(Collection.USERS, UserSchemaMongo);
  return model.findOne({ email: email.trim().toLowerCase() });
};
