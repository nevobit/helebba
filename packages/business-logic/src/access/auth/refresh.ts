import { createHash, randomUUID } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, SessionSchemaMongo, type AccessSession } from '@hlb/contracts';
import { hashRefreshToken, issueJwt, verifyRefreshToken } from '@hlb/security';

type RefreshSessionInput = {
  refreshToken: string;
};

export const refreshSession = async ({ refreshToken }: RefreshSessionInput) => {
  let claims;
  try {
    claims = await verifyRefreshToken(refreshToken);
  } catch {
    throw new Error('Invalid refresh token');
  }

  const currentHash = hashRefreshToken(refreshToken);
  const model = getModel<AccessSession>(Collection.SESSIONS, SessionSchemaMongo);

  const session = await model.findOne({
    sessionId: claims.sessionId,
    refreshTokenHash: currentHash,
    status: 'active',
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  if (!session) {
    await model.updateOne(
      { sessionId: claims.sessionId },
      { $set: { status: 'revoked', revokedAt: new Date(), revokeReason: 'refresh_replay' } },
    );
    throw new Error('Invalid refresh token');
  }

  const kind = session.organizationId ? 'organization' : 'global';

  const accessToken = await issueJwt({
    secretOrPrivateKey: process.env.JWT_SECRET!,
    payload: {
      typ: 'access',
      kind,
      userId: claims.userId,
      sessionId: session.sessionId,
      organizationId: kind === 'organization' ? String(session.organizationId) : undefined,
      membershipId: kind === 'organization' ? claims.membershipId : undefined,
      roleId: kind === 'organization' ? claims.roleId : undefined,
      jti: randomUUID(),
    },
    issuer: 'helebba.auth',
    audience: 'helebba.api',
    subject: claims.userId,
    algorithm: 'HS256',
    expiresIn: '1d',
    notBefore: '0s',
    keyid: 'access-hs256-v1',
  });

  const nextRefreshToken = await issueJwt({
    secretOrPrivateKey: process.env.JWT_REFRESH_SECRET!,
    payload: {
      typ: 'refresh',
      kind,
      userId: claims.userId,
      sessionId: session.sessionId,
      organizationId: kind === 'organization' ? String(session.organizationId) : undefined,
      membershipId: kind === 'organization' ? claims.membershipId : undefined,
      roleId: kind === 'organization' ? claims.roleId : undefined,
      jti: randomUUID(),
    },
    issuer: 'helebba.auth',
    audience: 'helebba.api',
    subject: claims.userId,
    expiresIn: '7d',
    notBefore: '0s',
    keyid: 'refresh-hs256-v1',
  });

  const nextHash = hashRefreshToken(nextRefreshToken);

  await model.updateOne(
    { _id: session._id },
    { $set: { refreshTokenHash: nextHash, updatedBy: claims.userId } },
  );

  return {
    token: accessToken,
    refreshToken: nextRefreshToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
};