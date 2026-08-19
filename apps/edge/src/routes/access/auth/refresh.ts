import { refreshSession } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { problem } from './responses';

type RefreshBody = {
  refreshToken?: string;
};

export const refreshRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/refresh',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const { refreshToken } = (req.body ?? {}) as RefreshBody;

    if (!refreshToken) {
      problem(reply, 400, 'Refresh token is required', 'refresh_token_required');
      return;
    }

    try {
      const out = await refreshSession({ refreshToken });
      reply.status(200).send(out);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid refresh token') {
        problem(reply, 401, error.message, 'invalid_refresh_token');
        return;
      }
      throw error;
    }
  },
);