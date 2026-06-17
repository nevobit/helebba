import { Button, TextInput } from '@hlb/design-system';
import { CloudUpload, Search } from 'lucide-react';
import styles from '../../screens/ContactsList/ContactsList.module.css';
import type { ContactScope } from '../../services';

type ContactsToolbarProps = {
  activeScope: ContactScope;
  query: string;
  onScopeChange: (scope: ContactScope) => void;
  onQueryChange: (value: string) => void;
};

export const Toolbar = ({
  activeScope,
  query,
  onScopeChange,
  onQueryChange,
}: ContactsToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <div className={styles.segmented} aria-label="Tipo de contacto">
          <button
            type="button"
            data-active={activeScope === 'all' || undefined}
            onClick={() => onScopeChange('all')}
          >
            Todos
          </button>

          <button
            type="button"
            data-active={activeScope === 'companies' || undefined}
            onClick={() => onScopeChange('companies')}
          >
            Empresas
          </button>

          <button
            type="button"
            data-active={activeScope === 'people' || undefined}
            onClick={() => onScopeChange('people')}
          >
            Personas
          </button>
        </div>

        <label className={styles.selectLabel}>
          <span>Orden</span>
          <select defaultValue="az">
            <option value="az">Contactos AZ</option>
            <option value="recent">Más recientes</option>
          </select>
        </label>

        <button className={styles.filterButton} type="button">
          + Filtro
        </button>
      </div>

      <div className={styles.toolbarRight}>
        <TextInput
          className={styles.searchField}
          label="Buscar contacto"
          labelHidden
          icon={<Search size={16} />}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />

        <Button
          className={styles.iconButton}
          variant="outline"
          theme="optional"
          size="medium"
          icon={<CloudUpload size={17} />}
          aria-label="Importar contactos"
        />
      </div>
    </div>
  );
};
