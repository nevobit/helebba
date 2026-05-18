import { createHash, timingSafeEqual } from 'node:crypto';

export const hashApiKey = (raw: string): string => {
  const pepper = process.env.API_KEY_PEPPER ?? '';
  if (!pepper) throw new Error('Missing API_KEY_PEPPER');
  return createHash('sha256').update(`${raw}:${pepper}`).digest('hex');
};

export const constantTimeEqualsHex = (a: string, b: string): boolean => {
  try {
    const ab = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ab.length !== bb.length) return false;
    return timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
};
