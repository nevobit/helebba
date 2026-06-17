import { Button, Menus, Tooltip } from '@hlb/design-system';
import { ChevronDown, Grid2X2Plus, Info } from 'lucide-react';
import styles from '../../screens/ProductsList/ProductsList.module.css';
import { useCreateProductModal } from '../../hooks';

type HeaderProps = {
  onProductCreated?: () => void;
};

export const Header = ({ onProductCreated }: HeaderProps) => {
  const { openCreateProductModal } = useCreateProductModal();

  return (
    <header className={styles.header}>
      <Tooltip content="Gestiona tu catálogo, inventario, precios y variantes de productos.">
        <h1 className={styles.titleGroup}>
          Productos
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

        <Menus defaultPlacement="bottom-end">
          <Menus.Menu>
            <Menus.Toggle
              id="products-actions"
              className={styles.headerMenuButton}
              aria-label="Acciones"
              verticalIcon
            />
            <Menus.List id="products-actions" placement="bottom-end">
              <Menus.Item id="import-products">Importar productos</Menus.Item>
              <Menus.Item id="export-products">Exportar productos</Menus.Item>
            </Menus.List>
          </Menus.Menu>
        </Menus>

        <div className={styles.primarySplit}>
          <Button onClick={() => openCreateProductModal({ onSuccess: onProductCreated })} size="medium">
            Nuevo producto <span className={styles.shortcut}>N</span>
          </Button>
          <button type="button" aria-label="Más opciones para crear producto">
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
};
