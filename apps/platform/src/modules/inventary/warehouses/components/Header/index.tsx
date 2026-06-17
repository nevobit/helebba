import { Button, Tooltip } from '@hlb/design-system';
import { Grid2X2Plus, Info } from 'lucide-react';
import { useCreateWarehouseModal } from '../../hooks';
import styles from '../../screens/WarehousesList/WarehousesList.module.css';

type HeaderProps = {
  onWarehouseCreated?: () => void;
};

export const Header = ({ onWarehouseCreated }: HeaderProps) => {
  const { openCreateWarehouseModal } = useCreateWarehouseModal();

  return (
    <header className={styles.header}>
      <Tooltip content="Administra los almacenes y puntos de stock de tu inventario.">
        <h1 className={styles.titleGroup}>
          Almacenes
          <Info size={15} strokeWidth={1.5} aria-hidden="true" />
        </h1>
      </Tooltip>

      <div className={styles.headerActions}>
        <Button
          className={styles.iconButton}
          variant="outline"
          theme="optional"
          size="medium"
          icon={<Grid2X2Plus size={16} />}
          aria-label="Cambiar vista"
        />
        <Button onClick={() => openCreateWarehouseModal({ onSuccess: onWarehouseCreated })} size="medium">
          Nuevo almacén
        </Button>
      </div>
    </header>
  );
};
