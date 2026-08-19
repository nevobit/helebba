import { logout } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { verifyJwt } from '@hlb/security';

type LogoutBody = {
  all?: boolean;
};

export const logoutRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/logout',
  verifyJwt,
  { organization: 'none', auth: 'required' },
  async (req, reply) => {
    const auth = req.auth as unknown as { userId: string; claims?: { sessionId?: string } };
    const { all } = (req.body ?? {}) as LogoutBody;
    const sessionId = auth.claims?.sessionId;

    if (!auth.userId || !sessionId) {
      return reply.code(401).send({ message: 'INVALID_SESSION' });
    }

    const out = await logout({ userId: auth.userId as never, sessionId, all });
    reply.status(200).send(out);
  },
);