import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');

  return `scrypt$${salt}$${derived}`;
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [algorithm, salt, stored] = hashedPassword.split('$');

  if (algorithm !== 'scrypt' || !salt || !stored) {
    return false;
  }

  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH);

  return timingSafeEqual(derived, Buffer.from(stored, 'hex'));
};
