import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ApiKeySchemaMongo,
  type ApiKeyId,
  type ExternalApiKey,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

export type RevokeExternalApiKeyInput = {
  apiKeyId: ApiKeyId;
  organizationId: OrganizationId;
  userId: UserId;
};

export const revokeExternalApiKey = async ({
  apiKeyId,
  organizationId,
  userId,
}: RevokeExternalApiKeyInput) => {
  const model = getModel<ExternalApiKey>(Collection.API_KEYS, ApiKeySchemaMongo);
  const now = new Date();

  return model
    .findOneAndUpdate(
      { _id: apiKeyId, organizationId },
      {
        $set: {
          status: 'revoked',
          revokedAt: now,
          revokedBy: userId,
          updatedAt: now,
          updatedBy: userId,
        },
      },
      { new: true },
    )
    .select('-keyHash');
};
