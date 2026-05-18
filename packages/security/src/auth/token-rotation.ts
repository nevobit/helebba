import { generateRefreshToken, hashRefreshToken } from './refresh-token';

export interface RefreshSessionRecord {
  readonly sessionId: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly workspaceId?: string;
  readonly refreshTokenHash: string;
  readonly expiresAt: Date;
  readonly revokedAt?: Date;
}

export interface RefreshTokenRotationStore {
  findByRefreshTokenHash: (hash: string) => Promise<RefreshSessionRecord | null>;
  replaceRefreshTokenHash: (input: {
    sessionId: string;
    previousHash: string;
    nextHash: string;
    usedAt: Date;
  }) => Promise<void>;
  revokeSession: (sessionId: string, revokedAt: Date) => Promise<void>;
}

export interface RotateRefreshTokenOptions {
  readonly refreshToken: string;
  readonly store: RefreshTokenRotationStore;
  readonly now?: Date;
}

export interface RotateRefreshTokenResult {
  readonly session: RefreshSessionRecord;
  readonly refreshToken: string;
  readonly refreshTokenHash: string;
}

export const rotateRefreshToken = async (
  options: RotateRefreshTokenOptions,
): Promise<RotateRefreshTokenResult> => {
  const now = options.now ?? new Date();
  const previousHash = hashRefreshToken(options.refreshToken);
  const session = await options.store.findByRefreshTokenHash(previousHash);

  if (!session || session.revokedAt || session.expiresAt <= now) {
    throw new Error('Invalid refresh token');
  }

  const next = generateRefreshToken();

  await options.store.replaceRefreshTokenHash({
    sessionId: session.sessionId,
    previousHash,
    nextHash: next.hash,
    usedAt: now,
  });

  return {
    session,
    refreshToken: next.token,
    refreshTokenHash: next.hash,
  };
};

