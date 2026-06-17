import { otpSignup } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { problem } from './responses';

type OtpSignupBody = {
  email?: string;
};

export const otpSignupRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/otp/signup',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const body = (req.body ?? {}) as OtpSignupBody;

    if (!body.email) {
      problem(reply, 400, 'Email is required', 'email_required');
      return;
    }

    try {
      const sessionId = await otpSignup(body.email);

      reply.status(202).send({
        email: body.email,
        sessionId,
        expiresInSeconds: 30 * 60,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email format') {
        problem(reply, 400, error.message, 'invalid_email');
        return;
      }

      throw error;
    }
  },
);
