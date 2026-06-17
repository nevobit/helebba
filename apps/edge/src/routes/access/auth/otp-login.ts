import { otpLogin } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { problem } from './responses';

type OtpLoginBody = {
  email?: string;
};

export const otpLoginRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/otp/login',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const body = (req.body ?? {}) as OtpLoginBody;

    if (!body.email) {
      problem(reply, 400, 'Email is required', 'email_required');
      return;
    }

    try {
      const out = await otpLogin(body.email);

      reply.status(202).send({
        email: out.email,
        expiresInSeconds: 30 * 60,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email format') {
        problem(reply, 400, error.message, 'invalid_email');
        return;
      }

      if (error instanceof Error && error.message === 'User not found') {
        problem(reply, 404, error.message, 'user_not_found');
        return;
      }

      throw error;
    }
  },
);
