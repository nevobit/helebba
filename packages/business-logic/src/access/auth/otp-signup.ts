import { getMailer, getRedisWriteClient } from '@hlb/constant-definitions';
import { isEmail } from '@hlb/foundation';
import { generateTOTP } from '@hlb/security';

export const otpSignup = async (email: string) => {
  if (!isEmail(email)) {
    throw new Error('Invalid email format');
  }

  const sessionId = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const session = {
    id: sessionId,
    email,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  };

  const redisWrite = getRedisWriteClient();
  await redisWrite.setex(`registration:${sessionId}`, 1800, JSON.stringify(session));

  if (!process.env.TOTP_SECRET) throw new Error('TOTP_SECRET is not set');
  const verificationCode = await generateTOTP(process.env.TOTP_SECRET);

  const codeKey = `verification:${email}`;
  await redisWrite.setex(codeKey, 1800, verificationCode);

  const mailer = getMailer();
  await mailer.sendTemplate({
    to: email,
    template: {
      name: 'otp',
      props: {
        verificationCode,
      },
    },
  });

  return sessionId;
};
