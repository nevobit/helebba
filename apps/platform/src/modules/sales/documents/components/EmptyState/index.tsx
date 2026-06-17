import { useNavigate } from 'react-router-dom';
import { BookOpen, Check, Plus } from 'lucide-react';
import { Button } from '@hlb/design-system';
import type { DocumentConfig } from '../../types';
import styles from '../../screens/DocumentList/DocumentList.module.css';

type EmptyStateProps = {
  config: DocumentConfig;
};

export const EmptyState = ({ config }: EmptyStateProps) => (
  <EmptyStateContent config={config} />
);

const EmptyStateContent = ({ config }: EmptyStateProps) => {
  const navigate = useNavigate();
  const bullets =
    config.kind === 'purchase'
      ? [
          'Lleva el control de todas tus facturas y tickets de compra',
          'Digitaliza tus compras fácilmente con Escáner',
          'Contabiliza tus gastos automáticamente y sin esfuerzo',
        ]
      : [
          'Crea facturas profesionales en tan solo unos clics.',
          'Envía tus documentos por email y haz seguimiento de su estado.',
          'Cobra en línea de forma segura o conecta tus bancos.',
        ];

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyHero}>
        <div className={styles.emptyIllustration} aria-hidden="true">
          <div className={styles.invoiceArt}>
            <div className={styles.paper}>
              <i />
              <b />
              <b />
              <b />
            </div>
            <div className={styles.cardArt}>
              <i />
            </div>
          </div>
        </div>

        <div className={styles.emptyCopy}>
          <h2>{config.emptyTitle}</h2>
          <ul>
            {bullets.map((bullet) => (
              <li key={bullet}>
                <Check size={16} /> {bullet}
              </li>
            ))}
          </ul>
          <Button size="medium" icon={<Plus size={16} />} onClick={() => navigate(config.newPath)}>
            {config.emptyButton}
          </Button>
        </div>
      </div>

      <div className={styles.learnBox}>
        <span>
          <BookOpen size={18} />
        </span>
        <strong>{config.emptyArticle}</strong>
        <Button theme="optional" variant="outline" size="medium">
          Lee el artículo
        </Button>
      </div>
    </div>
  );
};
