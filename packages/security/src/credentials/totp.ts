import { generateSecret as generateSecretFn, generate, verify } from 'otplib';

export function generateSecret() {
  return generateSecretFn();
}

export function generateTOTP(secret: string) {
  return generate({ secret });
}

export function verifyTOTP(token: string, secret: string) {
  return verify({ token, secret });
}
