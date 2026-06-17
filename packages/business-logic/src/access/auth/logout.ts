import { Collection, getModel } from '@hlb/constant-definitions';
import { LifecycleStatus, SessionSchemaMongo, type UserId } from '@hlb/contracts';

type LogoutInput = {
  userId: UserId;
  sessionId: string;
  all?: boolean;
};
export const logout = async (input: LogoutInput) => {
  if (!input.userId || !input.sessionId) throw new Error('BAD_REQUEST');

  const model = getModel(Collection.SESSIONS, SessionSchemaMongo);

  const now = new Date();

  if (input.all) {
    const res = await model.updateMany(
      { userId: input.userId, lifecicleStatus: LifecycleStatus.ACTIVE },
      { $set: { status: 'revoked', revokedAt: now, revokeReason: 'logout_all' } },
    );
    return { ok: true, revokedCount: res.modifiedCount ?? 0 };
  }

  const res = await model.updateOne(
    { _id: input.sessionId, userId: input.userId, lifecycleStatus: LifecycleStatus.ACTIVE },
    { $set: { status: 'revoked', revokedAt: now, revokeReason: 'logout' } },
  );

  return { ok: true, revoked: res.modifiedCount > 0 };
};
