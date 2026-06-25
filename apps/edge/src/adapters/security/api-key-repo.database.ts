import { Collection, getModel } from '@hlb/constant-definitions';
import { ApiKeySchemaMongo, LifecycleStatus, type ExternalApiKey } from '@hlb/contracts';
import type { ApiKeyRecord, ApiKeyRepository } from '@hlb/security';

const toApiKeyRecord = (apiKey: ExternalApiKey): ApiKeyRecord => ({
  id: apiKey.id,
  status: apiKey.status,
  scopes: apiKey.scopes,
  products: apiKey.products,
  organizationId: apiKey.organizationId,
});

export const databaseApiKeyRepo = (): ApiKeyRepository => {
  const model = getModel<ExternalApiKey>(Collection.API_KEYS, ApiKeySchemaMongo);

  return {
    findByHash: async (hashHex) => {
      const apiKey = await model.findOne({
        keyHash: hashHex,
        status: 'active',
        lifecycleStatus: LifecycleStatus.ACTIVE,
        deletedAt: null,
        $or: [
          { expiresAt: null },
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      });

      return apiKey ? toApiKeyRecord(apiKey) : null;
    },
  };
};
