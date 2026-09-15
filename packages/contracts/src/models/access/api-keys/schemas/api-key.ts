import type {
  ApiKeyId,
  ISODateTimeString,
  OrganizationId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../../common';

export type ApiKeyStatus = 'active' | 'revoked';

export interface ExternalApiKey extends PersistedSoftDeletableEntity<ApiKeyId, UserId> {
  name: string;
  keyHash: string;
  keyPrefix: string;
  keyLast4: string;
  scopes: string[];
  products: string[];
  status: ApiKeyStatus;
  organizationId: OrganizationId;
  lastUsedAt?: Date | ISODateTimeString | null;
  expiresAt?: Date | ISODateTimeString | null;
  revokedAt?: Date | ISODateTimeString | null;
  revokedBy?: UserId | null;
  usageCount?: number;
  usageByType?: Record<string, number>;
}
