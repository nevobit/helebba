import { Button, Table } from '@hlb/design-system';
import { List } from 'lucide-react';
import styles from '../../screens/ProductsList/ProductsList.module.css';
import type { CategoryRow } from '../../types';
import EmptyState from '../EmptyState';
import { categoryColumns } from '../../columns';

type CategoriesTableProps = {
  rows: CategoryRow[];
  error: unknown;
  isLoading: boolean;
  hasCategories: boolean;
  refetch: () => void;
  onCreateCategory?: () => void;
};

export const CategoriesTable = ({
  rows,
  error,
  isLoading,
  hasCategories,
  refetch,
  onCreateCategory,
}: CategoriesTableProps) => {
  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus categorías.</strong>

        <Button variant="outline" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasCategories && !isLoading) {
    return <EmptyState onCreateCategory={onCreateCategory} />;
  }

  return (
    <div className={styles.tableWrap}>
      <Table
        ariaLabel="Categorías"
        columns={categoryColumns()}
        rows={rows}
        pageSize={rows.length}
        selectionMode="multi"
        defaultSort={{ key: 'name', dir: 'asc' }}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingText="Cargando categorías..."
        emptyText="No hay categorías para mostrar"
      />

      <div className={styles.columnMenu} aria-hidden="true">
        <List size={16} />
      </div>
    </div>
  );
};
