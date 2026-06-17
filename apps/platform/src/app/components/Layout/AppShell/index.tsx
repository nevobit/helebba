import { Outlet } from 'react-router-dom';
import Header from '../Header';
import styles from './AppShell.module.css';
import TopBar, { subscription } from '../TopBar';
import { useQuery } from '@tanstack/react-query';
import { SettingsDataPanel } from '@/modules/settings/components';
import { useSettingsHashRoute } from '@/modules/settings/hooks';
import { PaymentMethodsPanel } from '@/modules/settings/payment-methods/components';
import { UsersSettingsPanel } from '@/modules/settings/users/components';

const AppShell = () => {
  const { closeSettings, isPaymentMethodsOpen, isSettingsDataOpen, isUsersOpen, usersInitialView } =
    useSettingsHashRoute();
  const { data } = useQuery({
    queryKey: ['subscription'],
    queryFn: subscription,
  });

  const showTopBar = data?.status === 'trialing';

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
