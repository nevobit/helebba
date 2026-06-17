import { findByEmail } from '../../users';
import crypto from 'crypto';
import { issueTokens } from './tokens';

export type LoginInput = {
  email: string;
  code: string;
};
export const login = async (input: LoginInput) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.email)) {
    throw new Error('Invalid email format');
  }
  const user = await findByEmail(input.email);

  if (!user) {
    throw new Error('User not found');
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
