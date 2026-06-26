import type { FastifyReply, FastifyRequest } from 'fastify';
import { hashApiKey } from '@hlb/security';
import { apiKeyRepo } from '../../adapters/security';

const API_KEY_HEADER = 'api-key';

const repo = apiKeyRepo();

const getHeader = (req: FastifyRequest, name: string): string => {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? '';
  return typeof value === 'string' ? value : '';
};

export const validateSdkApiKey = async (req: FastifyRequest, reply: FastifyReply) => {
  const rawApiKey = getHeader(req, API_KEY_HEADER).trim();

  if (!rawApiKey) {
    reply.status(401).send({ error: 'unauthorized', message: 'Missing api-key header' });
    return null;
  }

  const record = await repo.findByHash(hashApiKey(rawApiKey));

  if (!record || record.status !== 'active') {
    reply.status(401).send({ error: 'unauthorized', message: 'Invalid API key' });
    return null;
  }

  if (!record.organizationId) {
    reply
      .status(403)
      .send({ error: 'forbidden', message: 'API key is not linked to an organization' });
    return null;
  }

  return {
    apiKeyId: record.id,
    organizationId: record.organizationId,
  };
};
