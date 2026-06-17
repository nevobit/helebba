import { BookOpen, Check, Plus } from 'lucide-react';
import { Button } from '@hlb/design-system';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  onCreateCategory?: () => void;
};

const EmptyState = ({ onCreateCategory }: EmptyStateProps) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyHero}>
      <div className={styles.emptyIllustration} aria-hidden="true">
        <div className={styles.illustrationCard}>
          <div className={styles.illustrationHeader}>
            <span />
            <i />
          </div>
          {['#ef4444', '#f59e0b', '#10b981', '#3b82f6'].map((color) => (
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
        <h2>Categorías</h2>
        <ul>
          <li>
            <Check size={16} /> Organiza productos por familias, usos o atributos.
          </li>
          <li>
            <Check size={16} /> Define opciones reutilizables para tu catálogo.
          </li>
          <li>
            <Check size={16} /> Controla qué categorías se muestran en el catálogo.
          </li>
        </ul>
        <Button size="medium" icon={<Plus size={16} />} onClick={onCreateCategory}>
          Añade tu primera categoría
        </Button>
      </div>
    </div>

    <div className={styles.learnBox}>
      <span>
        <BookOpen size={18} />
      </span>
      <strong>
        Desde aquí puedes crear categorías para estructurar mejor tu inventario y mantener tu catálogo ordenado.
      </strong>
      <Button theme="optional" variant="outline" size="medium">
        Lee el artículo
      </Button>
    </div>
  </div>
);

export default EmptyState;
