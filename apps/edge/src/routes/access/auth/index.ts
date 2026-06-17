import { withPrefix } from '@hlb/constant-definitions';
import { RouteOptions } from 'fastify';
import { loginRoute } from './login';
import { switchOrganizationRoute } from './login-organization';
import { otpLoginRoute } from './otp-login';
import { otpSignupRoute } from './otp-signup';
import { otpVerifyRoute } from './otp-verify';
import { sendEmailCodeRoute } from './send-email-code';
import { loginGoogleRoute } from './login-google';

export const authRoutes: RouteOptions[] = withPrefix('/auth', [
  otpLoginRoute,
  otpSignupRoute,
  otpVerifyRoute,
  sendEmailCodeRoute,
  loginRoute,
  switchOrganizationRoute,
  loginGoogleRoute,
]);
