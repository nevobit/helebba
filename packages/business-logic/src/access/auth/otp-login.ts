import { getMailer, getRedisWriteClient } from '@hlb/constant-definitions';
import { isEmail } from '@hlb/foundation';
import { findByEmail } from '../../users';
import { generateTOTP } from '@hlb/security';

export const otpLogin = async (email: string) => {
  if (!isEmail(email)) {
    throw new Error('Invalid email format');
  }
  const user = await findByEmail(email);

  if (!process.env.TOTP_SECRET) throw new Error('TOTP_SECRET is not set');
  const verificationCode = await generateTOTP(process.env.TOTP_SECRET);

  const codeKey = `verification:${email}`;

  const redisWrite = getRedisWriteClient();
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

  return { email: user.email };
};
