import { useEffect, useState } from 'react';

export const SETTINGS_DATA_HASH = 'settings:/settings/data';
export const SETTINGS_HOME_HASH = 'settings:/';
export const SETTINGS_ACCOUNT_HASH = 'settings:/account';
export const SETTINGS_PAYMENT_METHODS_HASH = 'settings:/settings/payment-methods';
export const SETTINGS_USERS_HASH = 'settings:/users';
export const SETTINGS_USERS_ROLES_HASH = 'settings:/users/roles';
export const SETTINGS_DEVELOPER_CREDENTIALS_HASH = 'settings:/settings/developers/credentials';
export const SETTINGS_PRODUCT_FIELDS_HASH = 'settings:/settings/product-fields';
export const SETTINGS_PRODUCT_CONFIGURATION_HASH = 'settings:/inventory/products';
export const SETTINGS_NAVIGATION_HASH = 'settings:/settings/navigation';
export const SETTINGS_CRM_PREFERENCES_HASH = 'settings:/crm/preferences';
export const SETTINGS_CATEGORY_HASHES = {
  billing: 'settings:/billing',
  accounting: 'settings:/accounting',
  projects: 'settings:/projects',
  crm: 'settings:/crm',
  hr: 'settings:/hr',
  inventory: 'settings:/inventory',
  pos: 'settings:/pos',
  more: 'settings:/more',
} as const;

export type SettingsCategory = keyof typeof SETTINGS_CATEGORY_HASHES;

const getCurrentHashRoute = () => decodeURIComponent(window.location.hash.replace(/^#/, ''));

export const useSettingsHashRoute = () => {
  const [hashRoute, setHashRoute] = useState(() => getCurrentHashRoute());

  useEffect(() => {
    const syncHashRoute = () => setHashRoute(getCurrentHashRoute());

    window.addEventListener('hashchange', syncHashRoute);

    return () => window.removeEventListener('hashchange', syncHashRoute);
  }, []);

  const closeSettings = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    setHashRoute('');
  };

  return {
    closeSettings,
    isSettingsHomeOpen: hashRoute === SETTINGS_HOME_HASH,
    isSettingsAccountOpen: hashRoute === SETTINGS_ACCOUNT_HASH,
    isCrmPreferencesOpen: hashRoute === SETTINGS_CRM_PREFERENCES_HASH,
    settingsCategory: (Object.entries(SETTINGS_CATEGORY_HASHES).find(
      ([, hash]) => hash === hashRoute,
    )?.[0] ?? null) as SettingsCategory | null,
    isSettingsDataOpen: hashRoute === SETTINGS_DATA_HASH,
    isPaymentMethodsOpen: hashRoute === SETTINGS_PAYMENT_METHODS_HASH,
    isProductFieldsOpen: hashRoute === SETTINGS_PRODUCT_FIELDS_HASH,
    isProductConfigurationOpen: hashRoute === SETTINGS_PRODUCT_CONFIGURATION_HASH,
    isNavigationOpen: hashRoute === SETTINGS_NAVIGATION_HASH,
    isUsersOpen:
      hashRoute === SETTINGS_USERS_HASH ||
      hashRoute === SETTINGS_USERS_ROLES_HASH ||
      hashRoute === SETTINGS_DEVELOPER_CREDENTIALS_HASH,
    usersInitialView:
      hashRoute === SETTINGS_USERS_ROLES_HASH
        ? ('roles' as const)
        : hashRoute === SETTINGS_DEVELOPER_CREDENTIALS_HASH
          ? ('credentials' as const)
          : ('users' as const),
  };
};
