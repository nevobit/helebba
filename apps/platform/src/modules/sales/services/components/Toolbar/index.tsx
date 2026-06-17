import { Button, TextInput } from '@hlb/design-system';
import { CloudUpload, Search } from 'lucide-react';
import styles from '../../screens/ServicesList/ServicesList.module.css';

type ServicesToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export const Toolbar = ({ query, onQueryChange }: ServicesToolbarProps) => (
  <div className={styles.toolbar}>
    <div className={styles.toolbarLeft}>
      <label className={styles.selectLabel}>
        <span>Tipo de servicio</span>
        <select defaultValue="all">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="archived">Archivados</option>
        </select>
      </label>

      <button className={styles.filterButton} type="button">
        + Filtro
      </button>
    </div>

    <div className={styles.toolbarRight}>
      <TextInput
        className={styles.searchField}
        label="Buscar servicio"
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
        aria-label="Importar servicios"
      />
    </div>
  </div>
);
