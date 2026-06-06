import { Collection, getModel } from '@hlb/constant-definitions';
import { UserSchemaMongo, type User, type ProductId } from '@hlb/contracts';

export const getUserByEmail = async (email: string) => {
  const model = getModel<User>(Collection.USERS, UserSchemaMongo);
  const user = await model.findOne({ email });
  return user;
};
