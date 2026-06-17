import { Button, Menus, Tooltip } from '@hlb/design-system';
import { Grid2X2Plus, Info } from 'lucide-react';
import { useCreateServiceModal } from '../../hooks';
import styles from '../../screens/ServicesList/ServicesList.module.css';

type HeaderProps = {
  onServiceCreated?: () => void;
};

export const Header = ({ onServiceCreated }: HeaderProps) => {
  const { openCreateServiceModal } = useCreateServiceModal();

  return (
    <header className={styles.header}>
      <Tooltip content="Administra los servicios que vendes o facturas a tus clientes.">
        <h1 className={styles.titleGroup}>
          Servicios
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
            <Menus.Toggle id="services-actions" className={styles.actionsButton} aria-label="Acciones">
              Acciones
            </Menus.Toggle>
            <Menus.List id="services-actions" placement="bottom-end">
              <Menus.Item id="import-services">Importar servicios</Menus.Item>
              <Menus.Item id="export-services">Exportar servicios</Menus.Item>
            </Menus.List>
          </Menus.Menu>
        </Menus>

        <Button onClick={() => openCreateServiceModal({ onSuccess: onServiceCreated })} size="medium">
          Nuevo servicio <span className={styles.shortcut}>N</span>
        </Button>
      </div>
    </header>
  );
};
