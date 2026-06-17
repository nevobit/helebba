import { LifecycleStatus, type User } from '@hlb/contracts';
import { createUserFromGoogle, findByEmail } from '../../users';
import { issueTokens } from './tokens';
import crypto from 'crypto';

export type GoogleLoginInput = {
  email: string;
  name: string;
  photo: string;
  googleSub: string;
};

export type GoogleLoginOutput = {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
};

export const googleLogin = async (input: GoogleLoginInput): Promise<GoogleLoginOutput> => {
  const email = input.email.trim().toLowerCase();
  if (!email) throw new Error('GOOGLE_EMAIL_MISSING');
  if (!input.googleSub) throw new Error('GOOGLE_SUB_MISSING');

  let user: User = await findByEmail(email);

  if (!user) {
    user = await createUserFromGoogle({
      email,
      name: input.name,
      photo: input.photo,
      googleSub: input.googleSub,
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
