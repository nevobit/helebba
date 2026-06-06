import { Outlet } from 'react-router-dom';
import Header from '../Header';
import styles from './AppShell.module.css';

const AppShell = () => {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default AppShell;
