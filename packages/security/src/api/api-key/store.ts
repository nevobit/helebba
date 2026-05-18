import type { ApiKeyRecord, ApiKeyRepository, Cache } from './types';
import { hashApiKey } from './hash';

const cacheKey = (hashHex: string) => `ak:${hashHex}`;

export const buildApiKeyStore = (params: {
  repo: ApiKeyRepository;
  cache?: Cache;
  cacheTtlSeconds?: number;
}) => {
  const ttl = params.cacheTtlSeconds ?? 60;

  const getApiKey = async (rawApiKey: string): Promise<ApiKeyRecord | null> => {
    const keyHash = hashApiKey(rawApiKey);

    if (params.cache) {
      const cached = await params.cache.get(cacheKey(keyHash));
      if (cached) {
        try {
          return JSON.parse(cached) as ApiKeyRecord;
        } catch {
          // ignore cache corruption
        }
      }
    }

    const record = await params.repo.findByHash(keyHash);
    if (!record) return null;

    if (params.cache) {
      await params.cache.set(cacheKey(keyHash), JSON.stringify(record), ttl);
    }

    return record;
  };

  return { getApiKey };
};
