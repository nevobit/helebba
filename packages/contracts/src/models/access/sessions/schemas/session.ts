import type { BaseEntity, ISODateTimeString, OrganizationId, UserId } from '../../../../common';
import type { SessionId } from '../../rbac';

export interface SessionDevice {
  userAgent?: string;
  ipAddress?: string;
  type?: 'desktop' | 'mobile' | 'tablet' | 'other';
}

export interface Session extends BaseEntity<SessionId> {
  userId: UserId;
  organizationId?: OrganizationId;
  refreshTokenHash: string;
  sessionId: string;
  status: 'active' | 'revoked';
  device?: SessionDevice;
  expiresAt: ISODateTimeString;
  revokedAt?: ISODateTimeString | null;
  createdBy: UserId;
  updatedBy: UserId;
  deletedBy?: UserId;
  deletedAt?: ISODateTimeString | null;
}
