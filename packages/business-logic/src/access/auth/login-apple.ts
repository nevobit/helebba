import { LifecycleStatus, type User } from '@hlb/contracts';
import { createUserFromApple, findByEmail } from '../../users';
import { issueTokens } from './tokens';
import crypto from 'crypto';

export type AppleLoginInput = {
  email: string;
  name: string;
  photo: string;
  appleSub: string;
};

export type AppleLoginOutput = {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
};

export const appleLogin = async (input: AppleLoginInput): Promise<AppleLoginOutput> => {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error('APPLE_EMAIL_MISSING');
  if (!input.appleSub) throw new Error('APPLE_SUB_MISSING');

  let user: User = await findByEmail(email);

  if (!user) {
    user = await createUserFromApple({
      email,
      name: input.name,
      photo: input.photo,
      appleSub: input.appleSub,
      lifecycleStatus: LifecycleStatus.ACTIVE,
    });
  }

  if (user.lifecycleStatus !== LifecycleStatus.ACTIVE) {
    throw new Error('USER_DISABLED');
  }

  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;

  const { accessToken, refreshToken } = await issueTokens({
    kind: 'global',
    userId: user.id,
    sessionId,
  });

  return {
    accessToken,
    refreshToken,
    user,
  };
};