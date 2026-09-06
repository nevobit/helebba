import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, UserSchemaMongo, type User } from '@hlb/contracts';

type CreateUserFromAppleInput = {
  email: string;
  name: string;
  photo: string;
  appleSub: string;
  lifecycleStatus?: LifecycleStatus;
};

export const createUserFromApple = async (input: CreateUserFromAppleInput): Promise<User> => {
  const email = input.email.trim().toLowerCase();
  const model = getModel<User>(Collection.USERS, UserSchemaMongo);

  const user = await model.create({
    email,
    name: input.name,
    lifecycleStatus: input.lifecycleStatus ?? 'active',
    photo: input.photo,

    provider: {
      apple: {
        sub: input.appleSub,
        email,
      },
    },
  });

  return user;
};