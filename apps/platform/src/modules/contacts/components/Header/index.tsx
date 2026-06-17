import { Button, Tooltip } from '@hlb/design-system';
import { Grid2X2Plus, Info } from 'lucide-react';
import styles from '../../screens/ContactsList/ContactsList.module.css';
import { useCreateContactModal } from '../../hooks';

type HeaderProps = {
  onContactCreated?: () => void;
};

export const Header = ({ onContactCreated }: HeaderProps) => {
  const { openCreateContactModal } = useCreateContactModal();
  return (
    <header className={styles.header}>
      <Tooltip content="Gestiona tus clientes y proveedores sin esfuerzo, centralizando facturación, oportunidades y mucho más.">
        <h1 className={styles.titleGroup}>
          Contactos
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

        <Button theme="optional" variant="outline" size="medium" disclosure="down">
          Acciones
        </Button>

        <Button onClick={() => openCreateContactModal({ onSuccess: onContactCreated })} size="medium">
          Nuevo contacto <span className={styles.shortcut}>N</span>
        </Button>
      </div>
    </header>
  );
};
