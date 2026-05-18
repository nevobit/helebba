export function isBrowser(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as { window?: unknown }).window !== 'undefined' &&
    typeof (globalThis as { document?: unknown }).document !== 'undefined'
  );
}

export function isServer(): boolean {
  return !isBrowser();
}

export type UserAgentInfo = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  os: 'iOS' | 'Android' | 'Windows' | 'macOS' | 'Linux' | 'Other';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Opera' | 'Other';
};

export function getUserAgentInfo(ua: string): UserAgentInfo {
  const u = ua.toLowerCase();

  const isTablet =
    /ipad|tablet|kindle|playbook/.test(u) || (/android/.test(u) && !/mobile/.test(u));
  const isMobile = !isTablet && /mobi|iphone|ipod|android|blackberry|phone/.test(u);
  const isDesktop = !isMobile && !isTablet;

  let os: UserAgentInfo['os'] = 'Other';
  if (/windows/.test(u)) os = 'Windows';
  else if (/mac os x|macintosh/.test(u) && !/iphone|ipad|ipod/.test(u)) os = 'macOS';
  else if (/android/.test(u)) os = 'Android';
  else if (/iphone|ipad|ipod/.test(u)) os = 'iOS';
  else if (/linux/.test(u)) os = 'Linux';

  let browser: UserAgentInfo['browser'] = 'Other';
  if (/edg\//.test(u)) browser = 'Edge';
  else if (/chrome\//.test(u) && !/edg\//.test(u) && !/opr\//.test(u)) browser = 'Chrome';
  else if (/safari\//.test(u) && !/chrome\//.test(u)) browser = 'Safari';
  else if (/firefox\//.test(u)) browser = 'Firefox';
  else if (/opr\//.test(u)) browser = 'Opera';

  return { isMobile, isTablet, isDesktop, os, browser };
}
