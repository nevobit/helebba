import { randomUUID } from 'node:crypto';
import type { RouteOptions } from 'fastify';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import { issueJwt } from '@hlb/security';
import { validateSdkApiKey } from './auth';

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;

const createTokenRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/token',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const sdk = await validateSdkApiKey(req, reply);
    if (!sdk) return;

    const subject = `api-key:${sdk.apiKeyId}`;
    const accessToken = await issueJwt({
      secretOrPrivateKey: process.env.JWT_SECRET!,
      payload: {
        typ: 'access',
        kind: 'organization',
        userId: subject,
        organizationId: sdk.organizationId,
        jti: randomUUID(),
      },
      issuer: 'helebba.sdk',
      audience: 'helebba.api',
      subject,
      algorithm: 'HS256',
      expiresIn: `${ACCESS_TOKEN_EXPIRES_IN_SECONDS}s`,
      notBefore: '0s',
      keyid: 'sdk-access-hs256-v1',
    });

    return reply.status(200).send({
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    });
  },
);

export const sdkRoutes: RouteOptions[] = withPrefix('/sdk', [createTokenRoute]);
