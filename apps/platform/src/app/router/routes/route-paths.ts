export const PublicRoutes = {
  LOGIN: '/login',
  LOGIN_VERIFY: '/login/verify',
  SIGNUP: '/signup',
  SIGNUP_VERIFY: '/signup/verify',
} as const;

export const PrivateRoutes = {
  ROOT: '/',
  ACCOUNTS: '/accounts',
  NEW_ACCOUNT: '/accounts/new',
  CONTACTS: '/contacts',
  SERVICES: '/services',
  PRODUCTS: '/products',
  CATALOG: '/catalog',
  POS: '/pos',
  CRM_FUNNELS: '/crm/funnels',
  CATEGORIES: '/categories',
  BRANDS: '/brands',
  WAREHOUSES: '/inventory/warehouses',
  PAYMENTS: '/payments',
  BANK_ACCOUNTS: '/banking',
  DAHSBOARD: '/dahsboard',
  INVOICES: '/sales/revenue',
  ESTIMATES: '/sales/estimates',
  PURCHASES: '/purchases',
  SETUP: '/setup',
  TRIAL_EXPIRED: '/trial/expired',
} as const;
