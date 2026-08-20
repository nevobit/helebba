import { getRedisReadClient, getRedisWriteClient } from '@hlb/constant-definitions';
import type { User } from '@hlb/contracts';
import { isEmail } from '@hlb/foundation';
import { createUser, findByEmail } from '../../users';
import crypto from 'crypto';
import { issueTokens } from './tokens';

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 15 * 60;

const safeEquals = (a: string, b: string) => {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
};

export const otpVerify = async (user: Partial<User>, code: string) => {
  const redisRead = getRedisReadClient();
  const redisWrite = getRedisWriteClient();

  if (!isEmail(user.email!)) {
    throw new Error('Invalid email format');
  }

  const email = user.email!.toLowerCase();
  const codeKey = `verification:${email}`;
  const attemptsKey = `attempts:${email}`;

  const storedCode = await redisRead.get(codeKey);
  if (!storedCode) {
    throw new Error('Invalid or expired verification code');
  }

  const attempts = Number((await redisRead.get(attemptsKey)) ?? '0');
  if (attempts >= MAX_ATTEMPTS) {
    await redisWrite.del(codeKey);
    throw new Error('Too many attempts. Request a new code');
  }

  if (!safeEquals(storedCode, code)) {
    const next = await redisWrite.incr(attemptsKey);
    if (next === 1) {
      await redisWrite.expire(attemptsKey, COOLDOWN_SECONDS);
    }
    throw new Error('Invalid or expired verification code');
  }

  await redisWrite.del(codeKey);
  await redisWrite.del(attemptsKey);

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
