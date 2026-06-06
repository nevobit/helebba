import { issueJwt } from '@hlb/security';

type TokenKind = 'global' | 'organization';

type IssueTokensInput = {
  kind: TokenKind;
  userId: string;
  sessionId: string;

  organizationId?: string;
  membershipId?: string;
  roleId?: string;
};

export async function issueTokens(input: IssueTokensInput) {
  const { kind, userId, sessionId, organizationId, membershipId, roleId } = input;

  const accessToken = await issueJwt({
    secretOrPrivateKey: process.env.JWT_SECRET!,
    payload: {
      typ: 'access',
      kind,
      userId,
      sessionId,
      organizationId: kind === 'organization' ? organizationId : undefined,
      // membershipId: kind === "organization" ? membershipId : undefined,
      roleId: kind === 'organization' ? roleId : undefined,
      jti: crypto.randomUUID(),
    },
    issuer: 'helebba.auth',
    audience: 'helebba.api',
    subject: userId,
    algorithm: 'HS256',
    expiresIn: '1d',
    notBefore: '0s',
    keyid: 'access-hs256-v1',
  });

  const refreshToken = await issueJwt({
    secretOrPrivateKey: process.env.JWT_REFRESH_SECRET!,
    payload: {
      typ: 'refresh',
      kind: 'global',
      userId,
      sessionId,
      jti: crypto.randomUUID(),
    },
    issuer: 'helebba.auth',
    audience: 'helebba.api',
    subject: userId,
    expiresIn: '7d',
    notBefore: '0s',
    keyid: 'refresh-hs256-v1',
  });
  return { accessToken, refreshToken };
}
