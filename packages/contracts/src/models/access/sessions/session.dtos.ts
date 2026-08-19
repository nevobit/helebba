import type { Session } from './schemas';

export type CreateSessionDto = Omit<Session, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSessionDto = Partial<CreateSessionDto>;

export type RefreshTokenKind = 'global' | 'organization';

export type RefreshTokenPayload = {
  type: 'refresh';
  kind: RefreshTokenKind;
  userId: string;
  sessionId: string;
  organizationId?: string;
  membershipId?: string;
  roleId?: string;
  jti: string;
  iat?: number;
  exp?: number;
};
