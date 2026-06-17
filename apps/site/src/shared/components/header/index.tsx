import Image from 'next/image';
import styles from './Header.module.css';
import { ChevronDown } from 'lucide-react';

const navItems = [
  { label: 'Funcionalidades', hasDropdown: true },
  { label: 'Empresas', hasDropdown: true },
  { label: 'Autónomos' },
  { label: 'Asesorías', hasDropdown: true },
  { label: 'Recursos', hasDropdown: true },
  { label: 'Precios' },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <a href="#" className={styles.logo}>
          <Image src="/isotype.svg" width={20} height={20} alt="Logo Helebba" />
          <span>helebba</span>
        </a>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <a href="#" className={styles.navLink} key={item.label}>
              {item.label}
              {item.hasDropdown && (
                <span className={styles.chevron}>
                  <ChevronDown size={18} strokeWidth="1.5px" />
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={process.env.NEXT_PUBLIC_URL} className={styles.login}>
            Inicia sesión
          </a>

          <a href={process.env.NEXT_PUBLIC_URL} className={styles.trial}>
            Prueba gratis
            <span>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
