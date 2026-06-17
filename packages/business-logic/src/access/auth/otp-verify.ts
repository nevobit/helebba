import { getRedisReadClient, getRedisWriteClient } from '@hlb/constant-definitions';
import type { User } from '@hlb/contracts';
import { isEmail } from '@hlb/foundation';
import { createUser, findByEmail } from '../../users';
import crypto from 'crypto';
import { issueTokens } from './tokens';

export const otpVerify = async (user: Partial<User>, code: string) => {
  const redisRead = getRedisReadClient();
  const redisWrite = getRedisWriteClient();

  if (!isEmail(user.email!)) {
    throw new Error('Invalid email format');
  }

  const codeKey = `verification:${user.email}`;
  const storedCode = await redisRead.get(codeKey);

  if (!storedCode || storedCode !== code) {
    throw new Error('Invalid or expired verification code');
  }

  await redisWrite.del(codeKey);

  let userInfo;

  try {
    userInfo = await findByEmail(user.email!);
  } catch (error) {
    if (error instanceof Error && error.message !== 'User not found') {
      throw error;
    }
  }

  if (!userInfo) {
    userInfo = await createUser(user);
  }

  if (!userInfo.id) {
    throw new Error('Failed to get user ID from database');
  }

  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
  const { accessToken, refreshToken } = await issueTokens({
    kind: 'global',
    userId: userInfo.id,
    sessionId: sessionId,
  });

  return {
    token: accessToken,
    refreshToken,
    user: userInfo,
  };
};
