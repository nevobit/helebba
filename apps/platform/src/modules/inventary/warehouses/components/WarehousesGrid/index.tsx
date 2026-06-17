import { Button } from '@hlb/design-system';
import { Warehouse } from 'lucide-react';
import type { WarehouseRow } from '../../types';
import EmptyState from '../EmptyState';
import styles from '../../screens/WarehousesList/WarehousesList.module.css';

type WarehousesGridProps = {
  rows: WarehouseRow[];
  error: unknown;
  isLoading: boolean;
  hasWarehouses: boolean;
  refetch: () => void;
  onCreateWarehouse?: () => void;
};

export const WarehousesGrid = ({
  rows,
  error,
  isLoading,
  hasWarehouses,
  refetch,
  onCreateWarehouse,
}: WarehousesGridProps) => {
  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus almacenes.</strong>
        <Button variant="outline" theme="optional" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className={styles.feedback}>Cargando almacenes...</div>;
  }

  if (!hasWarehouses) {
    return <EmptyState onCreateWarehouse={onCreateWarehouse} />;
  }

  return (
    <div className={styles.grid}>
      {rows.map((warehouse) => (
        <article key={warehouse.id} className={styles.card}>
          <span className={styles.iconBubble}>
            <Warehouse size={28} strokeWidth={2} />
          </span>
          <div className={styles.cardName}>
            <i style={{ backgroundColor: warehouse.isDefault ? '#22a566' : warehouse.color }} />
            <strong>{warehouse.name}</strong>
          </div>
          {warehouse.isDefault && <span className={styles.defaultBadge}>Almacén por defecto</span>}
          {(warehouse.city || warehouse.country) && (
            <small>{[warehouse.city, warehouse.country].filter(Boolean).join(', ')}</small>
          )}
        </article>
      ))}
    </div>
  );
};
