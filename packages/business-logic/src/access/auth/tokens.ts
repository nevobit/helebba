import { createHash } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  type AccessSession,
  LifecycleStatus,
  SessionSchemaMongo,
  type OrganizationId,
  type UserId,
  type ISODateTimeString,
} from '@hlb/contracts';
import { issueJwt } from '@hlb/security';
import { createSession } from '../sessions';

type TokenKind = 'global' | 'organization';

type IssueTokensInput = {
  kind: TokenKind;
  userId: string;
  sessionId: string;

  organizationId?: string;
  membershipId?: string;
  roleId?: string;
  rememberMe?: boolean;
};

export async function issueTokens(input: IssueTokensInput) {
  const { kind, userId, sessionId, organizationId, membershipId, roleId, rememberMe } = input;

  const isRememberMe = rememberMe ?? false;
  const accessExpiry = isRememberMe ? '30d' : '1d';
  const refreshExpiry = isRememberMe ? '30d' : '7d';

  const accessToken = await issueJwt({
    secretOrPrivateKey: process.env.JWT_SECRET!,
    payload: {
      typ: 'access',
      kind,
      userId,
      sessionId,
      organizationId: kind === 'organization' ? organizationId : undefined,
      membershipId: kind === 'organization' ? membershipId : undefined,
      roleId: kind === 'organization' ? roleId : undefined,
      jti: crypto.randomUUID(),
    },
    issuer: 'helebba.auth',
    audience: 'helebba.api',
    subject: userId,
    algorithm: 'HS256',
    expiresIn: accessExpiry,
    notBefore: '0s',
    keyid: 'access-hs256-v1',
  });

  const refreshToken = await issueJwt({
    secretOrPrivateKey: process.env.JWT_REFRESH_SECRET!,
    payload: {
      typ: 'refresh',
      kind,
      userId,
      sessionId,
      organizationId: kind === 'organization' ? organizationId : undefined,
      membershipId: kind === 'organization' ? membershipId : undefined,
      roleId: kind === 'organization' ? roleId : undefined,
      jti: crypto.randomUUID(),
    },
    issuer: 'helebba.auth',
    audience: 'helebba.api',
    subject: userId,
    expiresIn: refreshExpiry,
    notBefore: '0s',
    keyid: 'refresh-hs256-v1',
  });

  const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');

  await createSession({
    userId: userId as UserId,
    organizationId: organizationId as OrganizationId,
    kind,
    refreshTokenHash,
    sessionId,
  });

  return { accessToken, refreshToken };
}
