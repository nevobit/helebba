import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ApiKeySchemaMongo,
  LifecycleStatus,
  type ExternalApiKey,
  type OrganizationId,
} from '@hlb/contracts';

export const listExternalApiKeys = async (organizationId: OrganizationId) => {
  const model = getModel<ExternalApiKey>(Collection.API_KEYS, ApiKeySchemaMongo);

  return model
    .find({
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      deletedAt: null,
    })
    .select('-keyHash')
    .sort({ createdAt: -1 });
};
