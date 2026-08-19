import { useSession } from '@/shared';
import { Avatar, Menus } from '@hlb/design-system';
import styles from './UserMenu.module.css';
import { Code2, LogOut, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { PublicRoutes } from '@/app/router/routes/route-paths';
import { useLogout } from '@/modules/auth/hooks';
import {
  SETTINGS_DATA_HASH,
  SETTINGS_DEVELOPER_CREDENTIALS_HASH,
  SETTINGS_PAYMENT_METHODS_HASH,
  SETTINGS_USERS_HASH,
} from '@/modules/settings/hooks';

export const UserMenu = () => {
  const user = useSession((state) => state.user);
  const organization = useSession((state) => state.organization);
  const signOut = useSession((state) => state.signOut);
  const { logout, isLoggingOut } = useLogout();

  const navigate = useNavigate();

  const navigateHash = (route: string) => {
    window.location.hash = route;
  };

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        googleLogout();
        signOut();
        navigate(PublicRoutes.LOGIN, { replace: true });
      },
    });
  };

  return (
    <Menus.Menu>
      <Menus.Toggle id="user-options" className={styles.profile}>
        <Avatar size="xs" name={user?.name} />
        <span className={styles.profileInfo}>
          <strong className={styles.profileName}>{user?.name}</strong>
          <span className={styles.profileOrganizationName}>{organization?.name}</span>
        </span>
      </Menus.Toggle>

      <Menus.List id="user-options">
        <span className={styles.userOptions}>
          <Menus.Item
            className={styles.btn}
            id="settings"
            onClick={() => navigateHash(SETTINGS_DATA_HASH)}
          >
            <Settings size={16} /> <span> Configuración</span>
          </Menus.Item>
          <Menus.Item
            className={styles.btn}
            id="payment-methods"
            onClick={() => navigateHash(SETTINGS_PAYMENT_METHODS_HASH)}
          >
            <Settings size={16} /> <span> Formas de pago</span>
          </Menus.Item>
          <Menus.Item
            className={styles.btn}
            id="users"
            onClick={() => navigateHash(SETTINGS_USERS_HASH)}
          >
            <Users size={16} /> <span> Usuarios</span>
          </Menus.Item>
          <Menus.Item
            className={styles.btn}
            id="developer-credentials"
            onClick={() => navigateHash(SETTINGS_DEVELOPER_CREDENTIALS_HASH)}
          >
            <Code2 size={16} /> <span> API Tokens</span>
          </Menus.Item>

          <Menus.Item className={styles.btn} id="logout" onClick={handleLogout}>
            <LogOut size={16} /> <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </Menus.Item>
        </span>
      </Menus.List>
    </Menus.Menu>
  );
};
