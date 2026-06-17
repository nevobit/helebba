import { Collection, getModel } from '@hlb/constant-definitions';
import { SessionSchemaMongo, type Session, type UserId } from '@hlb/contracts';

export async function findActiveSessionByUserIdAndHash(
  userId: UserId,
  refreshTokenHash: string,
): Promise<Session | null> {
  const model = getModel<Session>(Collection.SESSIONS, SessionSchemaMongo);

  const session = await model.findOne({
    userId,
    refreshTokenHash,
    status: 'active',
  });

  if (!session) return null;

  return session;
}
