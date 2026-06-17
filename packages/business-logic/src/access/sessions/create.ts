import { Collection, getModel } from '@hlb/constant-definitions';
import {
  LifecycleStatus,
  SessionSchemaMongo,
  type AccessSession,
  type ISODateTimeString,
  type OrganizationId,
  type UserId,
} from '@hlb/contracts';

type SessionInput = {
  userId: UserId;
  organizationId: OrganizationId;
  kind: string;
  refreshTokenHash: string;
  sessionId: string;
};

export const createSession = async (input: SessionInput) => {
  const model = getModel<AccessSession>(Collection.SESSIONS, SessionSchemaMongo);

  await model.create({
    userId: input.userId,
    organizationId: input.kind === 'organization' ? input.organizationId : undefined,
    refreshTokenHash: input.refreshTokenHash,
    sessionId: input.sessionId,
    status: 'active',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) as unknown as ISODateTimeString,
    createdBy: input.userId,
    updatedBy: input.userId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
    deletedAt: null,
  });
};
