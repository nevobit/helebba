import { useNavigate } from 'react-router-dom';
import { Button, Menus, Tooltip } from '@hlb/design-system';
import { ChevronDown, Grid2X2Plus, Info } from 'lucide-react';
import type { DocumentConfig } from '../../types';
import styles from '../../screens/DocumentList/DocumentList.module.css';

type HeaderProps = {
  config: DocumentConfig;
};

export const Header = ({ config }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <Tooltip content={`Gestiona tus ${config.title.toLowerCase()}.`}>
        <h1 className={styles.titleGroup}>
          {config.title}
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
            <Menus.Toggle id={`${config.kind}-actions`} className={styles.actionsButton} aria-label="Acciones">
              Acciones
            </Menus.Toggle>
            <Menus.List id={`${config.kind}-actions`} placement="bottom-end">
              <Menus.Item id={`import-${config.kind}`}>{config.importLabel}</Menus.Item>
              <Menus.Item id={`export-${config.kind}`}>Exportar</Menus.Item>
            </Menus.List>
          </Menus.Menu>
        </Menus>

        <Button size="medium" onClick={() => navigate(config.newPath)}>
          {config.newLabel} <span className={styles.shortcut}>N</span>
        </Button>
        <Button className={styles.iconButton} size="medium" icon={<ChevronDown size={16} />} aria-label="Crear con opciones" />
      </div>
    </header>
  );
};
