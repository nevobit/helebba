import { appleLogin } from '@hlb/business-logic';
import { makeFastifyRoute, RouteMethod } from '@hlb/constant-definitions';
import { createHash, createSign, createVerify } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

// type AppleLoginRequestBody = {
//   code: string;
//   state?: string;
// };

const appleClientId = process.env.APPLE_CLIENT_ID;
const appleTeamId = process.env.APPLE_TEAM_ID;
const appleKeyId = process.env.APPLE_KEY_ID;
const applePrivateKeyPath = process.env.APPLE_PRIVATE_KEY_PATH;

// if (!appleClientId) {
//   throw new Error('APPLE_CLIENT_ID_MISSING');
// }

// if (!appleTeamId) {
//   throw new Error('APPLE_TEAM_ID_MISSING');
// }

// if (!appleKeyId) {
//   throw new Error('APPLE_KEY_ID_MISSING');
// }

if (!applePrivateKeyPath) {
  throw new Error('APPLE_PRIVATE_KEY_PATH_MISSING');
}

// const applePrivateKey = readFileSync(applePrivateKeyPath, 'utf8');
const applePrivateKey = '';

const generateClientSecret = () => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'ES256', kid: appleKeyId };
  const payload = {
    iss: appleTeamId,
    iat: now,
    exp: now + 3600, // 1 hour
    aud: 'https://appleid.apple.com',
    sub: appleClientId,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const sign = createSign('SHA256');
  sign.update(signingInput);
  const signature = sign.sign({ key: applePrivateKey, format: 'pem', dsaEncoding: 'ieee-p1363' });

  return `${signingInput}.${signature.toString('base64url')}`;
};

const verifyIdToken = async (idToken: string) => {
  const [headerB64, payloadB64, signatureB64] = idToken.split('.');

  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Invalid ID token format');
  }

  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

  if (payload.aud !== appleClientId) {
    throw new Error('Invalid audience');
  }

  if (payload.iss !== 'https://appleid.apple.com') {
    throw new Error('Invalid issuer');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error('Token expired');
  }

  // Fetch Apple's public keys
  const jwksResponse = await fetch('https://appleid.apple.com/auth/keys');
  const jwks = await jwksResponse.json();

  const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
  const key = jwks.keys.find((k: any) => k.kid === header.kid && k.alg === header.alg);

  if (!key) {
    throw new Error('Unable to find matching key');
  }

  // Verify signature using crypto
  const verify = createVerify('SHA256');
  verify.update(`${headerB64}.${payloadB64}`);
  const publicKey = `
-----BEGIN PUBLIC KEY-----
${key.n.match(/.{1,64}/g)?.join('\n') || key.n}
-----END PUBLIC KEY-----
`;

  const isValid = verify.verify(
    { key: publicKey, format: 'pem' },
    Buffer.from(signatureB64, 'base64url'),
  );

  if (!isValid) {
    throw new Error('Invalid signature');
  }

  return payload;
};

type AppleLoginRequestBody = {
  code: string;
  state?: string;
};

export const loginAppleRoute = makeFastifyRoute(
  RouteMethod.POST,
  '/oauth/apple/callback',
  null,
  { organization: 'none', auth: 'none' },
  async (req, reply) => {
    const body = req.body as AppleLoginRequestBody;

    if (!body.code) {
      return reply.code(400).send({ message: 'APPLE_CODE_MISSING' });
    }

    const clientSecret = generateClientSecret();

    // const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     client_id: appleClientId,
    //     client_secret: clientSecret,
    //     code: body.code,
    //     grant_type: 'authorization_code',
    //   }),
    // });

    // if (!tokenResponse.ok) {
    //   const error = await tokenResponse.text();
    //   return reply.code(400).send({ message: 'APPLE_TOKEN_EXCHANGE_FAILED', detail: error });
    // }

    // const tokens = await tokenResponse.json();

    // if (!tokens.id_token) {
    //   return reply.code(401).send({ message: 'APPLE_ID_TOKEN_MISSING' });
    // }

    // const payload = await verifyIdToken(tokens.id_token);

    const payload = {
      email: '',
      sub: '',
      given_name: '',
      family_name: '',
    };
    if (!payload.email) {
      return reply.code(400).send({ message: 'APPLE_EMAIL_MISSING' });
    }

    if (!payload.sub) {
      return reply.code(400).send({ message: 'APPLE_SUB_MISSING' });
    }

    const name = `${payload.given_name ?? ''} ${payload.family_name ?? ''}`.trim() || payload.email;
    const photo = ''; // Apple doesn't provide photo in id_token

    const out = await appleLogin({
      email: payload.email,
      name,
      photo,
      appleSub: payload.sub,
    });

    return reply.code(200).send(out);
  },
);
