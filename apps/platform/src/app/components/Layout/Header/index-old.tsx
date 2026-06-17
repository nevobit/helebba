import { Avatar, Menus } from '@hlb/design-system';
import styles from './Header.module.css';
import { useSession } from '@/shared';
import {
  Bell,
  BookOpen,
  CreditCard,
  Gift,
  Info,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PrivateRoutes } from '@/app/router/routes';

const Header = () => {
  const user = useSession((state) => state.user);
  const organization = useSession((state) => state.organization);

  const navigate = useNavigate();

  const logoutHandler = () => {
    // googleLogout();
    localStorage.clear();
    navigate('/login');
  };

  const navigateHash = (route: string) => {
    window.location.hash = route;
  };

  return (
    <div className={styles.header}>
      <nav>
        <img src="/images/isotype.svg" alt="Helebba" className={styles.logo} />
        <ul>
          <li>
            <Link to={PrivateRoutes.CONTACTS}>Contactos</Link>
          </li>
          <li>Ventas</li>
          <li>Gastos</li>
          <li>CRM</li>
          <li>RRHH</li>
          <li>
            <Link to={PrivateRoutes.PRODUCTS}>Inventario</Link>
          </li>
          <li>Proyectos</li>
          <li>Tesorería</li>
          <li>Contabilidad</li>
        </ul>
      </nav>

      <div className={styles.headerRight}>
        <div className={styles.options}>
          <Plus size={18} strokeWidth="2px" />
          <Search size={18} strokeWidth="2px" />
          <Bell size={18} strokeWidth="2px" />
          <Info size={18} strokeWidth="2px" />
        </div>

        <Menus.Menu>
          <Menus.Toggle id="user-options" className={styles.profile}>
            <Avatar size="xs" name={user?.name} />
            <span className={styles.profileInfo}>
              <strong className={styles.profileName}>{user?.name}</strong>
              <span className={styles.profileOrganizationName}>{organization?.name}</span>
            </span>
          </Menus.Toggle>

          <Menus.List id="user-options">
            <span className={styles.user_options}>
              <li>
                <button onClick={() => navigateHash('/settings/profile')}>
                  <User size={16} /> Editar perfil
                </button>
              </li>
              <li>
                <button onClick={() => navigateHash('settings/configuration')}>
                  <Settings size={16} /> Configuración
                </button>
              </li>
              <li>
                <button onClick={() => navigateHash('settings/subscription')}>
                  <CreditCard size={16} /> Suscripción
                </button>
              </li>
              <li>
                <button onClick={() => navigate(PrivateRoutes.ACCOUNTS)}>
                  <Gift size={16} /> Invita y gana 50 CO$
                </button>
              </li>
              <span className={styles.sepator}></span>
              <li>
                <button onClick={() => navigate('/partners/marketplace')}>
                  <BookOpen size={16} /> Asesores financieros
                </button>
              </li>
              <span className={styles.sepator}></span>
              <li>
                <Link to={PrivateRoutes.NEW_ACCOUNT}>
                  <Plus size={16} /> Anadir cuenta
                </Link>
              </li>
              <li>
                <button onClick={logoutHandler}>
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </li>
            </span>
          </Menus.List>
        </Menus.Menu>
      </div>
    </div>
  );
};

export default Header;
