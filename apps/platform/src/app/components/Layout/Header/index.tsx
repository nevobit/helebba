import { UserMenu } from './components';
import { HeaderNavigation } from './components/HeaderNavigation';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <HeaderNavigation isMobileMenuOpen />
      <UserMenu />
    </header>
  );
};

export default Header;
