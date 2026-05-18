import { createHash, randomBytes } from 'node:crypto';
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

const sha256 = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};
