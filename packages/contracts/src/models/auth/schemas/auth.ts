import type { ISODateTimeString, PersistedEntity, OrganizationId, UserId } from '../../../common';
import { type SessionId } from '../../rbac';
export interface AccessTokenClaims {
  readonly sub: string;
  readonly organizationId: string;
  readonly sessionId: string;
  readonly email: string;
  readonly roleCodes: readonly string[];
  readonly permissionKeys: readonly string[];
  readonly type: 'access';
  readonly iat: number;
  readonly exp: number;
}
export interface Session extends PersistedEntity<SessionId, UserId> {
  readonly organizationId: OrganizationId;
  readonly userId: UserId;
  readonly refreshTokenHash: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
  readonly lastUsedAt?: ISODateTimeString;
  readonly expiresAt: ISODateTimeString;
  readonly revokedAt?: ISODateTimeString;
}
