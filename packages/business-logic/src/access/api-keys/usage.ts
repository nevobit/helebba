import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ApiKeySchemaMongo,
  LifecycleStatus,
  type ApiKeyId,
  type ExternalApiKey,
  type OrganizationId,
} from '@hlb/contracts';

const normalizeUsageType = (usageType: string) =>
  usageType.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'unknown';

export const recordExternalApiKeyUsage = async (
  apiKeyId: ApiKeyId,
  organizationId: OrganizationId,
  usageType: string,
) => {
  const model = getModel<ExternalApiKey>(Collection.API_KEYS, ApiKeySchemaMongo);
  const type = normalizeUsageType(usageType);

  return model.findOneAndUpdate(
    {
      id: apiKeyId,
      organizationId,
      status: 'active',
      lifecycleStatus: LifecycleStatus.ACTIVE,
      deletedAt: null,
    },
    {
      $inc: { usageCount: 1, [`usageByType.${type}`]: 1 },
      $set: { lastUsedAt: new Date() },
    },
    { new: true },
  );
};

export const getApiUsageByAutomationToken = async (organizationId: OrganizationId) => {
  const model = getModel<ExternalApiKey>(Collection.API_KEYS, ApiKeySchemaMongo);
  const records = await model
    .find({
      organizationId,
      lifecycleStatus: { $ne: LifecycleStatus.DELETED },
      deletedAt: null,
    })
    .select('id name keyPrefix keyLast4 status usageCount usageByType lastUsedAt createdAt')
    .sort({ usageCount: -1, createdAt: -1 })
    .lean();

  return records.map((record) => ({
    apiKeyId: record.id,
    name: record.name,
    token: `${record.keyPrefix}_••••${record.keyLast4}`,
    status: record.status,
    requests: record.usageCount ?? 0,
    usageByType: record.usageByType ?? {},
    lastUsedAt: record.lastUsedAt ?? null,
  }));
};

export const getApiUsageByType = async (organizationId: OrganizationId) => {
  const tokens = await getApiUsageByAutomationToken(organizationId);
  const totals = new Map<string, number>();

  for (const token of tokens) {
    for (const [type, count] of Object.entries(token.usageByType)) {
      totals.set(type, (totals.get(type) ?? 0) + Number(count || 0));
    }
  }

  return [...totals.entries()]
    .map(([type, requests]) => ({ type, requests }))
    .sort((left, right) => right.requests - left.requests || left.type.localeCompare(right.type));
};
