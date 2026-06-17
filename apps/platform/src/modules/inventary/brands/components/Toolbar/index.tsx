import { Button, TextInput } from '@hlb/design-system';
import { CloudUpload, Search } from 'lucide-react';
import styles from '../../screens/BrandsList/BrandsList.module.css';

type BrandsToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export const Toolbar = ({ query, onQueryChange }: BrandsToolbarProps) => (
  <div className={styles.toolbar}>
    <div className={styles.toolbarLeft}>
      <label className={styles.selectLabel}>
        <span>Tipo de marca</span>
        <select defaultValue="all">
          <option value="all">Todas</option>
        </select>
      </label>

      <button className={styles.filterButton} type="button">
        + Filtro
      </button>
    </div>

    <div className={styles.toolbarRight}>
      <TextInput
        className={styles.searchField}
        label="Buscar marca"
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
        aria-label="Importar marcas"
      />
    </div>
  </div>
);
