import { login } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { ContactId } from '@hlb/contracts';

export const loginRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/login',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const { email } = req.body as { email: string };
    const out = await login({ email, code: '123456' });
    reply.status(200).send(out);
  },
);
