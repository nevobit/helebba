import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Header from '../Header';
import styles from './AppShell.module.css';
import TopBar, { subscription } from '../TopBar';
import { useQuery } from '@tanstack/react-query';
import { SettingsDataPanel } from '@/modules/settings/components';
import { useSettingsHashRoute } from '@/modules/settings/hooks';
import { PaymentMethodsPanel } from '@/modules/settings/payment-methods/components';
import { UsersSettingsPanel } from '@/modules/settings/users/components';
import { PrivateRoutes } from '@/app/router/routes/route-paths';

const hasTrialExpired = (trialEndsAt?: string) => {
  if (!trialEndsAt) return false;

  const endsAt = new Date(trialEndsAt);
  return !Number.isNaN(endsAt.getTime()) && endsAt.getTime() <= Date.now();
};

const AppShell = () => {
  const location = useLocation();
  const { closeSettings, isPaymentMethodsOpen, isSettingsDataOpen, isUsersOpen, usersInitialView } =
    useSettingsHashRoute();
  const { data, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscription,
  });

  const isExpired = data?.status === 'expired' || (data?.status === 'trialing' && hasTrialExpired(data.trialEndsAt));
  const isExpiredRoute = location.pathname === PrivateRoutes.TRIAL_EXPIRED;
  const showTopBar = data?.status === 'trialing' && !isExpired;

  if (!isLoading && isExpired && !isExpiredRoute) {
    return <Navigate to={PrivateRoutes.TRIAL_EXPIRED} replace />;
  }

  if (!isLoading && data && !isExpired && isExpiredRoute) {
    return <Navigate to={PrivateRoutes.ROOT} replace />;
  }

  return (
    <div className={styles.shell} data-has-topbar={showTopBar}>
      {showTopBar && <TopBar />}
      <Header />
      <div className={styles.content}>
        <Outlet />
      </div>
      {isSettingsDataOpen && <SettingsDataPanel onClose={closeSettings} />}
      {isPaymentMethodsOpen && <PaymentMethodsPanel onClose={closeSettings} />}
      {isUsersOpen && <UsersSettingsPanel initialView={usersInitialView} onClose={closeSettings} />}
    </div>
  );
};

export default AppShell;
