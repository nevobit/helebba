import { BookOpen, Check, Plus } from 'lucide-react';
import { Button } from '@hlb/design-system';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  onCreateService?: () => void;
};

const EmptyState = ({ onCreateService }: EmptyStateProps) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyHero}>
      <div className={styles.emptyIllustration} aria-hidden="true">
        <div className={styles.illustrationFrame}>
          <span className={styles.frameIcon} />
          {[0, 1].map((group) => (
            <div key={group} className={styles.cardGroup}>
              {[0, 1, 2].map((item) => (
                <div key={item} className={styles.serviceCard}>
                  <i />
                  <b />
                  <b />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.emptyCopy}>
        <h2>Servicios</h2>
        <ul>
          <li>
            <Check size={16} /> Organiza tus servicios en productos virtuales.
          </li>
          <li>
            <Check size={16} /> Presupuesta y factura de forma ágil.
          </li>
          <li>
            <Check size={16} /> Simplifica tu catálogo de servicios.
          </li>
        </ul>
        <Button size="medium" icon={<Plus size={16} />} onClick={onCreateService}>
          Crea tu primer servicio
        </Button>
      </div>
    </div>

    <div className={styles.learnBox}>
      <span>
        <BookOpen size={18} />
      </span>
      <strong>
        Desde aquí puedes crear y personalizar tu catálogo de servicios, así como analizar tus
        compras y ventas por servicio gracias a los múltiples informes disponibles.
      </strong>
      <Button theme="optional" variant="outline" size="medium">
        Lee el artículo
      </Button>
    </div>
  </div>
);

export default EmptyState;
