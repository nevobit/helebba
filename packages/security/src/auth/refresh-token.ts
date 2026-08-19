import { createHash, randomBytes } from 'node:crypto';
import { jwtVerify } from 'jose';
import type { RefreshTokenPayload } from '@hlb/contracts';

export interface RefreshTokenResult {
  readonly token: string;
  readonly hash: string;
}

export const generateRefreshToken = (): RefreshTokenResult => {
  const token = randomBytes(48).toString('base64url');
  const hash = sha256(token);

  return { token, hash };
};

export const hashRefreshToken = (token: string): string => {
  return sha256(token);
};

export const buildRefreshTokenPayload = (payload: RefreshTokenPayload): RefreshTokenPayload => {
  return {
    ...payload,
    type: 'refresh',
  };
};

export const verifyRefreshToken = async (token: string): Promise<RefreshTokenPayload> => {
  const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);
  const result = await jwtVerify(token, secret, {
    issuer: 'helebba.auth',
    audience: 'helebba.api',
  });

  const payload = result.payload as unknown as RefreshTokenPayload;

  if (payload.type !== 'refresh' || !payload.sessionId || !payload.userId) {
    throw new Error('Invalid refresh token');
  }

  return payload;
};

const sha256 = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};