import { randomBytes } from 'node:crypto';
import { Collection, getModel } from '@hlb/constant-definitions';
import {
  ApiKeySchemaMongo,
  LifecycleStatus,
  type ExternalApiKey,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';
import { hashApiKey } from '@hlb/security';

export type CreateExternalApiKeyInput = {
  organizationId: OrganizationId;
  userId: UserId;
  name: string;
  scopes?: string[];
  expiresAt?: Date | string | null;
};

export type PublicExternalApiKey = Omit<ExternalApiKey, 'keyHash'>;

export type CreatedExternalApiKey = {
  apiKey: string;
  record: PublicExternalApiKey;
};

const DEFAULT_SCOPES = ['inventory:read'];
const DEFAULT_PRODUCTS = ['GSDK'];
const API_KEY_PREFIX = 'hlb_live';

const generateApiKey = () => `${API_KEY_PREFIX}_${randomBytes(32).toString('base64url')}`;

const normalizeScopes = (scopes: string[] | undefined) => {
  const normalized = (scopes?.length ? scopes : DEFAULT_SCOPES)
    .map((scope) => scope.trim())
    .filter(Boolean);

  return [...new Set(normalized)];
};

export const createExternalApiKey = async ({
  expiresAt,
  name,
  organizationId,
  scopes,
  userId,
}: CreateExternalApiKeyInput): Promise<CreatedExternalApiKey> => {
  const model = getModel<ExternalApiKey>(Collection.API_KEYS, ApiKeySchemaMongo);
  const apiKey = generateApiKey();
  const keyPrefix = apiKey.split('_').slice(0, 2).join('_');

  const record = await model.create({
    name: name.trim(),
    keyHash: hashApiKey(apiKey),
    keyPrefix,
    keyLast4: apiKey.slice(-4),
    scopes: normalizeScopes(scopes),
    products: DEFAULT_PRODUCTS,
    status: 'active',
    organizationId,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    lastUsedAt: null,
    revokedAt: null,
    revokedBy: null,
    createdBy: userId,
    updatedBy: userId,
    deletedAt: null,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });

  const publicRecord = record.toObject() as ExternalApiKey & { keyHash?: string };
  delete publicRecord.keyHash;

  return { apiKey, record: publicRecord };
};
