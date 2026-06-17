import { BookOpen, Check, Plus } from 'lucide-react';
import styles from './EmptyState.module.css';
import { Button } from '@hlb/design-system';

type EmptyStateProps = {
  onCreateContact?: () => void;
};

const EmptyState = ({ onCreateContact }: EmptyStateProps) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyHero}>
        <div className={styles.emptyIllustration} aria-hidden="true">
          <div className={styles.illustrationSidebar}>
            <span>TP</span>
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className={styles.illustrationMain}>
            <div className={styles.illustrationCard}>
              <span />
              <i />
              <i />
              <b />
            </div>
            <div className={styles.illustrationChart}>
              <div>
                <strong>34.321,00</strong>
                <strong>23.885,00</strong>
              </div>
              <span />
            </div>
          </div>
        </div>

        <div className={styles.emptyCopy}>
          <h2>Contactos</h2>
          <p>Gestiona con precisión toda la información sobre tus clientes y proveedores.</p>
          <ul>
            <li>
              <Check size={16} /> Todos tus clientes, proveedores y oportunidades en un solo lugar.
            </li>
            <li>
              <Check size={16} /> Gestiona la facturación de forma eficiente con cada uno de tus
              contactos.
            </li>
            <li>
              <Check size={16} /> Toda la información siempre a la vista.
            </li>
          </ul>
          <div className={styles.emptyActions}>
            <Button size="medium" icon={<Plus size={16} />} onClick={onCreateContact}>
              Nuevo contacto
            </Button>
            <Button theme="optional" variant="outline" size="medium">
              Importar contactos
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.learnBox}>
        <span>
          <BookOpen size={18} />
        </span>
        <strong>Aprende a importar y gestionar tus clientes y proveedores</strong>
        <Button theme="optional" variant="outline" size="medium">
          Lee el artículo
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
