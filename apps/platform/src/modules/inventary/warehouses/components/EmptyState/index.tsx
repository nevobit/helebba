import { Button } from '@hlb/design-system';
import { Plus, Warehouse } from 'lucide-react';
import styles from '../../screens/WarehousesList/WarehousesList.module.css';

type EmptyStateProps = {
  onCreateWarehouse?: () => void;
};

const EmptyState = ({ onCreateWarehouse }: EmptyStateProps) => (
  <div className={styles.emptyState}>
    <Warehouse size={36} strokeWidth={1.8} />
    <h2>Crea tu primer almacén</h2>
    <p>Organiza tus existencias por almacén y define uno como principal.</p>
    <Button icon={<Plus size={16} />} onClick={onCreateWarehouse}>
      Nuevo almacén
    </Button>
  </div>
);

export default EmptyState;
