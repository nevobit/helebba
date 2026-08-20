import { withPrefix } from '@hlb/constant-definitions';
import { RouteOptions } from 'fastify';
import { switchOrganizationRoute } from './login-organization';
import { otpLoginRoute } from './otp-login';
import { otpSignupRoute } from './otp-signup';
import { otpVerifyRoute } from './otp-verify';
import { sendEmailCodeRoute } from './send-email-code';
import { loginGoogleRoute } from './login-google';
import { refreshRoute } from './refresh';
import { logoutRoute } from './logout';

export const authRoutes: RouteOptions[] = withPrefix('/auth', [
  otpLoginRoute,
  otpSignupRoute,
  otpVerifyRoute,
  sendEmailCodeRoute,
  switchOrganizationRoute,
  loginGoogleRoute,
  refreshRoute,
  logoutRoute,
]);
