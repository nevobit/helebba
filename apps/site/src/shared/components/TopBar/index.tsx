import { Phone } from 'lucide-react';
import styles from './TopBar.module.css';

const TopBar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <span>Empieza ahora y consigue un 50% de descuento durante 3 meses</span>
        <div>
          <p>Habla con el equipo de ventas:</p>
          <span>
            <Phone size={18} strokeWidth="1.5px" /> +57 3206535488{' '}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
