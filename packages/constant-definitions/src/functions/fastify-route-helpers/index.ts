import type { RouteOptions, FastifyRequest, FastifyReply } from 'fastify';
import { type NormalizedRequest } from '../../types';
import { normalizeFastifyRequest } from '../normalize-fastify-request';

export enum RouteMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
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

export type VerifyTokenResult =
  | { ok: true; claims: JwtClaims }
  | {
      ok: false;
      code: 401 | 403 | 500;
      type: 'unauthorized' | 'invalid_token' | 'forbidden' | 'config_error';
      message: string;
    };

type AuthMode = 'required' | 'optional' | 'none';
type TenantMode = 'required' | 'optional' | 'none';

export type RoutePolicies = {
  organization?: TenantMode;
  auth?: AuthMode;
};

type MakeRouteOptions = Partial<Omit<RouteOptions, 'method' | 'url' | 'handler'>> & {
  auth?: AuthMode;
  organization?: TenantMode;
};

type AuthFunction = (req: NormalizedRequest) => Promise<VerifyTokenResult>;

declare module 'fastify' {
  interface FastifyRequest {
    organization?: {
      organizationId: string;
      slug: string;
      mode: 'host' | 'path' | 'header';
    };
    auth?: { userId: string; organizationId?: string; roleId?: string; claims: JwtClaims };
  }

  interface FastifyInstance {
    requireOrganization: () => (req: FastifyRequest) => Promise<void>;
  }
}

function problem(reply: FastifyReply, status: number, detail: string, type = 'about:blank') {
  return reply
    .code(status)
    .type('application/problem+json')
    .send({
      type,
      title:
        status === 400
          ? 'Bad Request'
          : status === 401
            ? 'Unauthorized'
            : status === 403
              ? 'Forbidden'
              : status === 404
                ? 'Not Found'
                : 'Internal Server Error',
      status,
      detail,
    });
}

export const makeFastifyRoute = (
  method: RouteMethod,
  url: string,
  authFunction: AuthFunction | null,
  policies: RoutePolicies | null,
  handler: (req: FastifyRequest, reply: FastifyReply) => Promise<void>,
  extraOptions?: MakeRouteOptions,
): RouteOptions => {
  const organizationPolicy: TenantMode = policies?.organization ?? 'none';
  const authPolicy: AuthMode = policies?.auth ?? (authFunction ? 'required' : 'none');

  const { auth = authFunction ? 'required' : 'none', ...fastifyOpts } = extraOptions ?? {};

  const enhancedHandler: RouteOptions['handler'] = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {
    if (organizationPolicy === 'required' && !request.organization) {
      return problem(reply, 400, 'Organization is required', 'organization_required');
    }

    const normalizedReq = normalizeFastifyRequest(request);
    if (authPolicy !== 'none' && authFunction) {
      const result = await authFunction(normalizedReq);

      if (!result.ok) {
        if (auth === 'required') {
          return reply.code(result.code).send({ error: result.type, message: result.message });
        }
      } else {
        const claims = result.claims;

        if (claims.kind === 'organization') {
          request.auth = {
            userId: claims.userId,
            organizationId: claims.organizationId,
            roleId: claims.roleId,
            claims,
          };
        } else {
          request.auth = {
            userId: claims.userId,
            organizationId: undefined,
            roleId: undefined,
            claims,
          };
        }
      }
    } else if (authPolicy === 'required' && !authFunction) {
      return problem(reply, 500, 'Auth is required but authFunction is null', 'auth_config_error');
    }
    return handler(request, reply);
  };

  return {
    ...fastifyOpts,
    method,
    url,
    handler: enhancedHandler,
  };
};

const join = (a: string, b: string) =>
  `${a}/${b}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';

export const withPrefix = (prefix: string, routes: RouteOptions[]): RouteOptions[] =>
  routes.map((r) => ({
    ...r,
    url: join(prefix, r.url),
  }));
