export const PublicRoutes = {
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  FORGOT: '/forgot',
  TESTING: '/testing',
} as const;

export const PrivateRoutes = {
  ROOT: '/',
  ACCOUNTS: '/accounts',
  NEW_ACCOUNT: '/accounts/new',
  DAHSBOARD: '/dahsboard',
  SETUP: '/setup',
  DEPARTMENTS: '/departments',
  TICKETS: '/tickets',
  TICKETS_DETAILS: '/tickets/:id',
  CUSTOMERS: '/customers',
  SETTINGS: '/settings',
  USERS: '/settings/users',
} as const;
