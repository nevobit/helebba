import { otpVerify } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { User } from '@hlb/contracts';
import { problem } from './responses';

type OtpVerifyBody = Partial<User> & {
  code?: string;
  user?: Partial<User>;
};

const buildUserInput = (body: OtpVerifyBody): Partial<User> => {
  if (body.user) {
    return body.user;
  }

  const user = { ...body };
  delete user.code;
  delete user.user;

  return user;
};

export const otpVerifyRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/otp/verify',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const body = (req.body ?? {}) as OtpVerifyBody;
    const user = buildUserInput(body);

    if (!body.code) {
      problem(reply, 400, 'Code is required', 'code_required');
      return;
    }

    if (!user.email) {
      problem(reply, 400, 'Email is required', 'email_required');
      return;
    }

    try {
      const out = await otpVerify(user, body.code);
      reply.status(200).send(out);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email format') {
        problem(reply, 400, error.message, 'invalid_email');
        return;
      }

      if (error instanceof Error && error.message === 'Invalid or expired verification code') {
        problem(reply, 400, error.message, 'invalid_or_expired_code');
        return;
      }

      throw error;
    }
  },
);
