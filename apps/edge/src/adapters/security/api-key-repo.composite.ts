import type { ApiKeyRepository } from '@hlb/security';
import { databaseApiKeyRepo } from './api-key-repo.database';
import { localApiKeyRepo } from './api-key-repo.local';

export const apiKeyRepo = (): ApiKeyRepository => {
  const database = databaseApiKeyRepo();
  const local = localApiKeyRepo();

  return {
    findByHash: async (hashHex) =>
      (await database.findByHash(hashHex)) ?? local.findByHash(hashHex),
  };
};
