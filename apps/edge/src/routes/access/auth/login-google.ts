import { googleLogin } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { OAuth2Client } from 'google-auth-library';

type GoogleLoginRequestBody = {
  code: string;
};

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId) {
  throw new Error('GOOGLE_CLIENT_ID_MISSING');
}

if (!googleClientSecret) {
  throw new Error('GOOGLE_CLIENT_SECRET_MISSING');
}

export const loginGoogleRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/oauth/google',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const googleClient = new OAuth2Client(googleClientId, googleClientSecret, 'postmessage');

    const body = req.body as GoogleLoginRequestBody;

    if (!body.code) {
      return reply.code(400).send({ message: 'GOOGLE_CODE_MISSING' });
    }

    const { tokens } = await googleClient.getToken(body.code);

    if (!tokens.id_token) {
      return reply.code(401).send({ message: 'GOOGLE_ID_TOKEN_MISSING' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return reply.code(401).send({ message: 'INVALID_GOOGLE_TOKEN' });
    }

    if (!payload.email) {
      return reply.code(400).send({ message: 'GOOGLE_EMAIL_MISSING' });
    }

    if (!payload.sub) {
      return reply.code(400).send({ message: 'GOOGLE_SUB_MISSING' });
    }

    if (payload.email_verified === false) {
      return reply.code(401).send({ message: 'GOOGLE_EMAIL_NOT_VERIFIED' });
    }

    const out = await googleLogin({
      email: payload.email,
      name: payload.name ?? payload.email,
      photo: payload.picture ?? '',
      googleSub: payload.sub,
    });

    return reply.code(200).send(out);
  },
);
