import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, UserSchemaMongo, type User } from '@hlb/contracts';

type CreateUserFromGoogleInput = {
  email: string;
  name: string;
  photo: string;
  googleSub: string;
  lifecycleStatus?: LifecycleStatus;
};

export const createUserFromGoogle = async (input: CreateUserFromGoogleInput): Promise<User> => {
  const email = input.email.trim().toLowerCase();
  const model = getModel<User>(Collection.USERS, UserSchemaMongo);

  const user = await model.create({
    email,
    name: input.name,
    lifecycleStatus: input.lifecycleStatus ?? 'active',
    photo: input.photo,

    provider: {
      google: {
        sub: input.googleSub,
        email,
      },
    },
  });

  return user;
};
