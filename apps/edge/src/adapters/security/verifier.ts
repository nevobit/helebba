import { createVerifier, buildApiKeyStore } from '@hlb/security';
import { apiKeyRepo } from './api-key-repo.composite';

export const buildVerifier = async () => {
  //   const redis = await getRedis();

  const repo = apiKeyRepo();

  const apiKeyStore = buildApiKeyStore({
    repo,
    // cache: redisCache(redis),
    cacheTtlSeconds: 60,
  });

  const deps = {
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
  };

  const opts = {};

  const verify = createVerifier(deps, opts);

  return verify;
};
