import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import type { AccessTokenClaims } from '@hlb/contracts';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

interface RequestInterface {
  Body: unknown;
  Query: unknown;
  Headers: unknown;
}
interface NormalizedRequest<R extends RequestInterface = RequestInterface> {
  protocol: string;
  secure?: boolean;
  subdomains?: string[];
  path?: string;
  hostname?: string;
  headers?: R['Headers'];
  body?: R['Body'];
  method?: string;
  query?: R['Query'];
  url?: string;
  ip?: string;
}

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

type GlobalAccessClaims = {
  kind: 'global';
  typ: string;
  userId: string;
  sessionId?: string;
  jti: string;
};

type WorkspaceAccessClaims = {
  kind: 'organization';
  typ: string;
  userId: string;
  organizationId?: string;
  membershipId?: string;
  roleId?: string;
  sessionId?: string;
  jti: string;
};

export type JwtClaims = GlobalAccessClaims | WorkspaceAccessClaims;

export interface IssueJwtOptions {
  secretOrPrivateKey: string;
  payload: JwtClaims;
  algorithm?: 'HS256';
  expiresIn?: string;
  notBefore?: string;
  issuer?: string;
  audience?: string | string[];
  subject?: string;
  keyid?: string;
}

export async function issueJwt(opts: IssueJwtOptions): Promise<string> {
  const {
    secretOrPrivateKey,
    payload,
    algorithm = 'HS256',
    expiresIn = '15m',
    notBefore,
    issuer,
    audience,
    subject,
    keyid,
  } = opts;

  const secret = encodeSecret(secretOrPrivateKey);

  let jwt = new SignJWT(payload as JWTPayload)
    .setProtectedHeader({
      alg: algorithm,
      ...(keyid ? { kid: keyid } : {}),
    })
    .setIssuedAt()
    .setExpirationTime(expiresIn);

  if (notBefore) jwt = jwt.setNotBefore(notBefore);
  if (issuer) jwt = jwt.setIssuer(issuer);
  if (audience) jwt = jwt.setAudience(audience);
  if (subject) jwt = jwt.setSubject(subject);

  return await jwt.sign(secret);
}

type VerifyTokenResult =
  | { ok: true; claims: JwtClaims }
  | {
      ok: false;
      code: 401 | 403 | 500;
      type: 'unauthorized' | 'invalid_token' | 'forbidden' | 'config_error';
      message: string;
    };

type AuthFunction = (req: NormalizedRequest) => Promise<VerifyTokenResult>;

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

export const verifyJwt: AuthFunction = async (
  req: NormalizedRequest,
): Promise<VerifyTokenResult> => {
  const authHeader = (req.headers as unknown as Record<string, string>)['authorization'];
  const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '') : null;

  console.log('Verifying JWT for request:', {
    token,
  });
  if (!token) {
    return {
      ok: false,
      code: 401,
      type: 'unauthorized',
      message: 'Missing bearer token',
    };
  }

  const { payload } = (await jwtVerify(token, secret)) as { payload: JwtClaims };

  console.log('Verified JWT payload:', payload);
  if (!payload.userId) {
    return {
      ok: false,
      code: 401,
      type: 'invalid_token',
      message: 'Token missing sub',
    };
  }

  return { ok: true, claims: payload };
};
