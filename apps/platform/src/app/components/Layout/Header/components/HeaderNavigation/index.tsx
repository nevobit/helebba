import { NavLink } from 'react-router-dom';
import styles from './HeaderNavigation.module.css';
import HeaderLink from '../HeaderLink';
import { useNavigationItems } from '../../hooks';

type HeaderNavigationProps = {
  isMobileMenuOpen: boolean;
};

export const HeaderNavigation = ({ isMobileMenuOpen }: HeaderNavigationProps) => {
  const navigationItems = useNavigationItems();

  return (
    <nav
      className={`${styles.nav} ${
        isMobileMenuOpen ? `${styles.mobile_menu} ${styles.active}` : ''
      }`}
    >
      <NavLink to="/" className={styles.logo}>
        <img src="/images/isotype.svg" alt="Logo Helebba" width={20} />
      </NavLink>

      {navigationItems.items.map((item) => (
        <HeaderLink key={item.id} name={item.name} path={item.path} subPaths={item.children} />
      ))}
    </nav>
  );
};
