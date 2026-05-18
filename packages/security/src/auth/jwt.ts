import { SignJWT, jwtVerify } from 'jose';
import type { AccessTokenClaims } from '@hlb/contracts';

export interface IssueAccessTokenOptions {
  readonly claims: Omit<AccessTokenClaims, 'iat' | 'exp' | 'type'>;
  readonly secret: string;
  readonly issuer: string;
  readonly audience: string;
  readonly expiresIn?: string;
}

export interface VerifyAccessTokenOptions {
  readonly token: string;
  readonly secret: string;
  readonly issuer: string;
  readonly audience: string;
}

const encodeSecret = (secret: string): Uint8Array => {
  return new TextEncoder().encode(secret);
};

export const issueAccessToken = async (options: IssueAccessTokenOptions): Promise<string> => {
  const secret = encodeSecret(options.secret);

  return await new SignJWT({
    ...options.claims,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(options.issuer)
    .setAudience(options.audience)
    .setSubject(options.claims.sub)
    .setIssuedAt()
    .setExpirationTime(options.expiresIn ?? '15m')
    .sign(secret);
};

export const verifyAccessToken = async (
  options: VerifyAccessTokenOptions,
): Promise<AccessTokenClaims> => {
  const secret = encodeSecret(options.secret);

  const result = await jwtVerify(options.token, secret, {
    issuer: options.issuer,
    audience: options.audience,
  });

  return result.payload as unknown as AccessTokenClaims;
};
