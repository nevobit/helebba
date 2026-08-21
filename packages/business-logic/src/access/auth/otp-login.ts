import { getMailer, getRedisWriteClient } from '@hlb/constant-definitions';
import { isEmail } from '@hlb/foundation';
import { findByEmail } from '../../users';
import { generateUserTOTP } from '@hlb/security';

export const otpLogin = async (email: string, rememberMe?: boolean) => {
  if (!isEmail(email)) {
    throw new Error('Invalid email format');
  }
  const user = await findByEmail(email);

  if (!process.env.TOTP_SECRET) throw new Error('TOTP_SECRET is not set');
  const verificationCode = await generateUserTOTP(process.env.TOTP_SECRET, email);

  const codeKey = `verification:${email.toLowerCase()}`;

  const codeData = {
    code: verificationCode,
    rememberMe: rememberMe ?? false,
  };

  const redisWrite = getRedisWriteClient();
  await redisWrite.setex(codeKey, 1800, JSON.stringify(codeData));

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
