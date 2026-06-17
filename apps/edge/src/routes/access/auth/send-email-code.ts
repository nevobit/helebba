import { otpLogin, otpSignup } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import type { FastifyReply } from 'fastify';

type EmailCodePurpose = 'login' | 'signup';

type SendEmailCodeBody = {
  email?: string;
  purpose?: unknown;
};

const CODE_TTL_SECONDS = 30 * 60;
const EMAIL_CODE_PURPOSES = new Set<EmailCodePurpose>(['login', 'signup']);

const isEmailCodePurpose = (value: unknown): value is EmailCodePurpose => {
  return typeof value === 'string' && EMAIL_CODE_PURPOSES.has(value as EmailCodePurpose);
};

const badRequest = (reply: FastifyReply, detail: string, type = 'invalid_request') => {
  reply.code(400).type('application/problem+json').send({
    type,
    title: 'Bad Request',
    status: 400,
    detail,
  });
};

export const sendEmailCodeRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/email/code',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const body = (req.body ?? {}) as SendEmailCodeBody;
    let purpose: EmailCodePurpose = 'login';

    if (!body.email) {
      badRequest(reply, 'Email is required', 'email_required');
      return;
    }

    if (body.purpose !== undefined) {
      if (!isEmailCodePurpose(body.purpose)) {
        badRequest(reply, 'Invalid verification purpose', 'invalid_verification_purpose');
        return;
      }

      purpose = body.purpose;
    }

    try {
      if (purpose === 'signup') {
        const sessionId = await otpSignup(body.email);

        reply.status(202).send({
          email: body.email,
          purpose,
          sessionId,
          expiresInSeconds: CODE_TTL_SECONDS,
        });
        return;
      }

      const out = await otpLogin(body.email);

      reply.status(202).send({
        email: out.email,
        purpose,
        expiresInSeconds: CODE_TTL_SECONDS,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email format') {
        badRequest(reply, error.message);
        return;
      }

      throw error;
    }
  },
);
