import { Button, Menus, Tooltip } from '@hlb/design-system';
import { Grid2X2Plus, Info } from 'lucide-react';
import styles from '../../screens/BrandsList/BrandsList.module.css';
import { useCreateBrandModal } from '../../hooks';

type HeaderProps = {
  onBrandCreated?: () => void;
};

export const Header = ({ onBrandCreated }: HeaderProps) => {
  const { openCreateBrandModal } = useCreateBrandModal();

  return (
    <header className={styles.header}>
      <Tooltip content="Administra las marcas asociadas a tus productos de inventario.">
        <h1 className={styles.titleGroup}>
          Marcas
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
            <Menus.Toggle id="brands-actions" className={styles.headerMenuButton} aria-label="Acciones" verticalIcon />
            <Menus.List id="brands-actions" placement="bottom-end">
              <Menus.Item id="import-brands">Importar marcas</Menus.Item>
              <Menus.Item id="export-brands">Exportar marcas</Menus.Item>
            </Menus.List>
          </Menus.Menu>
        </Menus>

        <Button onClick={() => openCreateBrandModal({ onSuccess: onBrandCreated })} size="medium">
          Nueva marca <span className={styles.shortcut}>N</span>
        </Button>
      </div>
    </header>
  );
};
