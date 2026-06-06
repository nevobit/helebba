export const APP_NAME = 'Platform';
export const ORG_NAME = 'helebba';

export const DEFAULT_LOCALE = 'es';
export const SUPPORTED_LOCALES = ['es', 'en', 'pt'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_CURRENCY = 'COP';
export const SUPPORTED_CURRENCIES = ['COP', 'USD', 'EUR'] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];
export const STORAGE_KEYS = {
  theme: `${ORG_NAME.toLowerCase()}:theme`,
  locale: `${ORG_NAME.toLowerCase()}:locale`,
  currency: `${ORG_NAME.toLowerCase()}:currency`,
  accountId: `${ORG_NAME.toLowerCase()}:accountId`,
} as const;

export const FEATURE_FLAGS = {
  newDashboard: false,
  betaBilling: false,
} as const;
