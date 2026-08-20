import { generateSecret as generateSecretFn, generate, verify } from 'otplib';
import { createHmac } from 'crypto';

export function generateSecret() {
  return generateSecretFn();
}

export function generateTOTP(secret: string) {
  return generate({ secret });
}

export function generateUserTOTP(globalSecret: string, email: string) {
  const derivedSecret = createHmac('sha256', globalSecret)
    .update(email.toLowerCase())
    .digest();

  return generate({ secret: derivedSecret });
}

export function verifyTOTP(token: string, secret: string) {
  return verify({ token, secret });
}
