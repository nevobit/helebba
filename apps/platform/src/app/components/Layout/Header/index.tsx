import styles from './Header.module.css';

const Header = () => {
  return (
    <div className={styles.header}>
      <img src="/images/isotype.svg" alt="Helebba" className={styles.logo} />
      <nav>
        <ul>
          <li>Contactos</li>
          <li>Ventas</li>
          <li>Gastos</li>
          <li>Tesorería</li>
          <li>Contabilidad</li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
