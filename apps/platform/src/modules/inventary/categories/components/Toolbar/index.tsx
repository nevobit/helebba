import { Button, TextInput } from '@hlb/design-system';
import { CloudUpload, Search } from 'lucide-react';
import styles from '../../screens/ProductsList/ProductsList.module.css';

type CategoriesToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export const Toolbar = ({ query, onQueryChange }: CategoriesToolbarProps) => (
  <div className={styles.toolbar}>
    <div className={styles.toolbarLeft}>
      <label className={styles.selectLabel}>
        <span>Tipo de categoría</span>
        <select defaultValue="all">
          <option value="all">Todas</option>
          <option value="options">Opciones</option>
          <option value="text">Texto/Número</option>
        </select>
      </label>

      <button className={styles.filterButton} type="button">
        + Filtro
      </button>
    </div>

    <div className={styles.toolbarRight}>
      <TextInput
        className={styles.searchField}
        label="Buscar categoría"
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
        aria-label="Importar categorías"
      />
    </div>
  </div>
);
