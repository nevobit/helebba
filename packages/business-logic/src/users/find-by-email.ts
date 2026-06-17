import { Collection, getModel } from '@hlb/constant-definitions';
import { UserSchemaMongo, type User, type ProductId } from '@hlb/contracts';

export const findByEmail = async (email: string) => {
  const model = getModel<User>(Collection.USERS, UserSchemaMongo);
  const user = await model.findOne({ email });
  if (!user) throw new Error('User not found');
  return user;
};
