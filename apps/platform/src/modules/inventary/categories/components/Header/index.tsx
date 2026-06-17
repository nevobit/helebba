import { Button, Menus, Tooltip } from '@hlb/design-system';
import { Grid2X2Plus, Info } from 'lucide-react';
import styles from '../../screens/ProductsList/ProductsList.module.css';
import { useCreateCategoryModal } from '../../hooks';

type HeaderProps = {
  onCategoryCreated?: () => void;
};

export const Header = ({ onCategoryCreated }: HeaderProps) => {
  const { openCreateCategoryModal } = useCreateCategoryModal();

  return (
    <header className={styles.header}>
      <Tooltip content="Organiza productos con categorías visibles o internas para tu inventario.">
        <h1 className={styles.titleGroup}>
          Categorías
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
              id="categories-actions"
              className={styles.headerMenuButton}
              aria-label="Acciones"
              verticalIcon
            />
            <Menus.List id="categories-actions" placement="bottom-end">
              <Menus.Item id="import-categories">Importar categorías</Menus.Item>
              <Menus.Item id="export-categories">Exportar categorías</Menus.Item>
            </Menus.List>
          </Menus.Menu>
        </Menus>

        <Button onClick={() => openCreateCategoryModal({ onSuccess: onCategoryCreated })} size="medium">
          Nueva categoría <span className={styles.shortcut}>N</span>
        </Button>
      </div>
    </header>
  );
};
