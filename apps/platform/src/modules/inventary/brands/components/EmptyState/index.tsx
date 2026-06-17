import { BookOpen, Check, Plus } from 'lucide-react';
import { Button } from '@hlb/design-system';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  onCreateBrand?: () => void;
};

const EmptyState = ({ onCreateBrand }: EmptyStateProps) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyHero}>
      <div className={styles.emptyIllustration} aria-hidden="true">
        <div className={styles.illustrationCard}>
          <div className={styles.illustrationHeader}>
            <span />
            <i />
          </div>
          {['#111827', '#2563eb', '#6b7280', '#10b981'].map((color) => (
            <div key={color} className={styles.illustrationRow}>
              <b style={{ background: color }} />
              <i />
              <i />
              <em />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.emptyCopy}>
        <h2>Marcas</h2>
        <ul>
          <li>
            <Check size={16} /> Agrupa productos por fabricante o marca comercial.
          </li>
          <li>
            <Check size={16} /> Mantén logos, sitios web y descripciones en un solo lugar.
          </li>
          <li>
            <Check size={16} /> Mejora la organización de tu inventario y catálogo.
          </li>
        </ul>
        <Button size="medium" icon={<Plus size={16} />} onClick={onCreateBrand}>
          Añade tu primera marca
        </Button>
      </div>
    </div>

    <div className={styles.learnBox}>
      <span>
        <BookOpen size={18} />
      </span>
      <strong>
        Desde aquí puedes crear marcas para enriquecer tus productos y facilitar filtros dentro del inventario.
      </strong>
      <Button theme="optional" variant="outline" size="medium">
        Lee el artículo
      </Button>
    </div>
  </div>
);

export default EmptyState;
