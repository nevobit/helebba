import { ChevronRight, Mail, Network, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { useSession } from '@/shared';
import {
  SETTINGS_DATA_HASH,
  SETTINGS_HOME_HASH,
  SETTINGS_USERS_HASH,
} from '@/modules/settings/hooks';
import styles from './AccountSettingsPanel.module.css';

type Props = { onClose: () => void };
const options = [
  { title: 'Configuración de la cuenta', icon: SlidersHorizontal, hash: SETTINGS_DATA_HASH },
  { title: 'Usuarios', icon: Network, hash: SETTINGS_USERS_HASH },
  { title: 'Configuración de email', icon: Mail, hash: SETTINGS_DATA_HASH },
  { title: 'Portal del cliente', icon: SlidersHorizontal, hash: SETTINGS_DATA_HASH },
];

export const AccountSettingsPanel = ({ onClose }: Props) => {
  const organization = useSession((state) => state.organization);
  const navigate = (hash: string) => window.location.assign(`#${hash}`);
  return (
    <div className={styles.overlay} role="presentation">
      <aside className={styles.panel} aria-label="Configuración de cuenta">
        <header className={styles.header}>
          <div>
            <span>CONFIGURACIÓN</span>
            <strong>{organization?.name || 'Mi organización'}</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>
        <main className={styles.content}>
          <button
            type="button"
            className={styles.breadcrumb}
            onClick={() => navigate(SETTINGS_HOME_HASH)}
          >
            Configuración <ChevronRight size={16} /> <span>Cuenta</span>
          </button>
          <section className={styles.intro}>
            <span className={styles.introIcon}>
              <UserRound size={30} />
            </span>
            <div>
              <h1>Cuenta</h1>
              <p>Personaliza tu cuenta, invita usuarios y configura el envío de correos.</p>
            </div>
          </section>
          <div className={styles.options}>
            {options.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.title} type="button" onClick={() => navigate(item.hash)}>
                  <span>
                    <Icon size={18} />
                  </span>
                  <strong>{item.title}</strong>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </div>
        </main>
      </aside>
    </div>
  );
};
