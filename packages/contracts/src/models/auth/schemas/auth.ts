import type {
  ISODateTimeString,
  PersistedEntity,
  TenantId,
  UserId,
  WorkspaceId,
} from '../../../common';
import { SessionId } from '../../rbac';

export interface Session extends PersistedEntity<SessionId, UserId> {
  readonly tenantId: TenantId;
  readonly workspaceId?: WorkspaceId;
  readonly userId: UserId;
  readonly refreshTokenHash: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly lastUsedAt?: ISODateTimeString;
  readonly expiresAt: ISODateTimeString;
  readonly revokedAt?: ISODateTimeString;
}
