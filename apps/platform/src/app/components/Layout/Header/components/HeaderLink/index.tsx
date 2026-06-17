import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './HeaderLink.module.css';

type HeaderSubPath = {
  id?: string;
  name: string;
  path: string;
};

type HeaderLinkProps = {
  name: string;
  path: string;
  subPaths?: HeaderSubPath[];
};

const HeaderLink = ({ name, path, subPaths = [] }: HeaderLinkProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasSubPaths = subPaths.length > 0;

  const openMenu = () => {
    if (hasSubPaths) setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div
      className={styles.menu}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      onFocus={openMenu}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeMenu();
        }
      }}
    >
      <NavLink
        to={path}
        className={({ isActive }) => `${styles.trigger} ${isActive ? styles.triggerActive : ''}`}
      >
        {name}
      </NavLink>

      {hasSubPaths && isMenuOpen && (
        <ul className={styles.menuOptions}>
          {subPaths.map((item) => (
            <li key={item.id ?? item.path} className={styles.menuOption}>
              <Link className={styles.menuLink} to={item.path} onClick={closeMenu}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeaderLink;
