import { useEffect, useState } from 'react';

export const SETTINGS_DATA_HASH = 'settings:/settings/data';
export const SETTINGS_PAYMENT_METHODS_HASH = 'settings:/settings/payment-methods';
export const SETTINGS_USERS_HASH = 'settings:/users';
export const SETTINGS_USERS_ROLES_HASH = 'settings:/users/roles';

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
    isSettingsDataOpen: hashRoute === SETTINGS_DATA_HASH,
    isPaymentMethodsOpen: hashRoute === SETTINGS_PAYMENT_METHODS_HASH,
    isUsersOpen: hashRoute === SETTINGS_USERS_HASH || hashRoute === SETTINGS_USERS_ROLES_HASH,
    usersInitialView: hashRoute === SETTINGS_USERS_ROLES_HASH ? 'roles' as const : 'users' as const,
  };
};
