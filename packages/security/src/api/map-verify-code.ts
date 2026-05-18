import { VerifyCode } from './verify';

export const mapVerifyCode = (code?: number): number => {
  switch (code) {
    case VerifyCode.MISSING_API_KEY:
    case VerifyCode.INVALID_API_KEY:
    case VerifyCode.MISSING_SIGNATURE:
    case VerifyCode.INVALID_SIGNATURE:
    case VerifyCode.MISSING_TIMESTAMP:
    case VerifyCode.SKEWED_TIMESTAMP:
    case VerifyCode.BAD_USER_AGENT:
      return 401;

    case VerifyCode.FORBIDDEN:
    case VerifyCode.REPLAY_NONCE:
      return 403;

    case VerifyCode.RATE_LIMITED:
      return 429;

    case VerifyCode.UPSTREAM_UNAVAILABLE:
      return 503;

    case VerifyCode.MISSING_PATH:
    case VerifyCode.PATH_MISMATCH:
    case VerifyCode.BAD_REQUEST:
    default:
      return 400;
  }
};
