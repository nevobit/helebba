import { BookOpen, Check, Plus } from 'lucide-react';
import { Button } from '@hlb/design-system';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  onCreateProduct?: () => void;
};

const EmptyState = ({ onCreateProduct }: EmptyStateProps) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyHero}>
      <div className={styles.emptyIllustration} aria-hidden="true">
        <div className={styles.illustrationCard}>
          <div className={styles.illustrationHeader}>
            <span />
            <i />
          </div>
          {['#111827', '#7668c9', '#94b98d', '#c79b73'].map((color) => (
            <div key={color} className={styles.illustrationRow}>
              <b style={{ background: color }} />
              <i />
              <i />
              <i />
              <em />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.emptyCopy}>
        <h2>Productos</h2>
        <ul>
          <li>
            <Check size={16} /> Administre su inventario con facilidad.
          </li>
          <li>
            <Check size={16} /> Categorías, variantes y mucho más para satisfacer tus necesidades.
          </li>
          <li>
            <Check size={16} /> Gestión avanzada de inventario con pedidos, envíos y más.
          </li>
        </ul>
        <Button size="medium" icon={<Plus size={16} />} onClick={onCreateProduct}>
          Añade tu primer producto
        </Button>
      </div>
    </div>

    <div className={styles.learnBox}>
      <span>
        <BookOpen size={18} />
      </span>
      <strong>
        Desde aquí puedes crear y personalizar tu catálogo de productos, administrar tus compras y
        ventas, y controlar el inventario actualizado en tiempo real gracias a los múltiples
        informes disponibles.
      </strong>
      <Button theme="optional" variant="outline" size="medium">
        Lee el artículo
      </Button>
    </div>
  </div>
);

export default EmptyState;
