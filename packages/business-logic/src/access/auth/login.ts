import { getUserByEmail } from '../../users';
import crypto from 'crypto';
import { issueTokens } from './tokens';

export type LoginInput = {
  email: string;
  code: string;
};
export const login = async (input: LoginInput) => {
  const user = await getUserByEmail(input.email);

  if (!user) {
    throw new Error('User not found');
  }

  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;

  const { accessToken, refreshToken } = await issueTokens({
    kind: 'global',
    userId: user.id,
    sessionId,
  });

  const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  return {
    accessToken,
    refreshToken,
    user,
  };
};
