import type { RouteOptions } from 'fastify';
import {
  createExternalApiKey,
  listExternalApiKeys,
  revokeExternalApiKey,
} from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod, withPrefix } from '@hlb/constant-definitions';
import { type ApiKeyId, type OrganizationId, type UserId } from '@hlb/contracts';
import { verifyJwt } from '@hlb/security';
import { problem } from '../../access/auth/responses';

type CreateApiKeyBody = {
  name?: string;
  scopes?: string[];
  expiresAt?: string | null;
};

const listApiKeysRoute = makeFastifyRoute(
  RouteMethod.GET,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const apiKeys = await listExternalApiKeys(req.organization?.organizationId as OrganizationId);
    return reply.status(200).send(apiKeys);
  },
);

const createApiKeyRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const body = (req.body ?? {}) as CreateApiKeyBody;

    if (!body.name?.trim()) {
      problem(reply, 400, 'API key name is required', 'api_key_name_required');
      return;
    }

    const created = await createExternalApiKey({
      organizationId: req.organization?.organizationId as OrganizationId,
      userId: req.auth?.userId as UserId,
      name: body.name,
      scopes: body.scopes,
      expiresAt: body.expiresAt ?? null,
    });

    return reply.status(201).send(created);
  },
);

const revokeApiKeyRoute = makeFastifyRoute(
  RouteMethod.DELETE,
  '/:apiKeyId',
  verifyJwt,
  { organization: 'required', auth: 'required' },
  async (req, reply) => {
    const { apiKeyId } = req.params as { apiKeyId: ApiKeyId };
    const apiKey = await revokeExternalApiKey({
      apiKeyId,
      organizationId: req.organization?.organizationId as OrganizationId,
      userId: req.auth?.userId as UserId,
    });

    if (!apiKey) {
      problem(reply, 404, 'API key not found', 'api_key_not_found');
      return;
    }

    return reply.status(200).send(apiKey);
  },
);

export const meApiKeyRoutes: RouteOptions[] = withPrefix('/api-keys', [
  listApiKeysRoute,
  createApiKeyRoute,
  revokeApiKeyRoute,
]);
