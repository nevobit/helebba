import { createVerifier, buildApiKeyStore } from '@hlb/security';
import { localApiKeyRepo } from './api-key-repo.local';

export const buildVerifier = async () => {
  //   const redis = await getRedis();

  const repo = localApiKeyRepo();

  const apiKeyStore = buildApiKeyStore({
    repo,
    // cache: redisCache(redis),
    cacheTtlSeconds: 60,
  });

  const verify = createVerifier({
    getApiKey: apiKeyStore.getApiKey,
    getSigningSecret: async ({ keyId }) => {
      if (!keyId) return process.env.API_HMAC_SECRET ?? null;

      // ✅ Opción con rotación por kid:
      // exporta secretos como HMAC_SECRET_<kid>
      return process.env[`HMAC_SECRET_${keyId}`] ?? null;
    },

    // nonceFirstSeen: (nonce, ttlMs) => redisNonceStore(redis).firstSeen(nonce, ttlMs),

    // allowRequest: (key, windowMs, limit) => redisRateLimiter(redis).allow(key, windowMs, limit),

    // getBodyHashHex: (body) => sha256HexFromRawBody(body)
  });

  return verify;
};
