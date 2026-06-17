import { Button, Table } from '@hlb/design-system';
import { List } from 'lucide-react';
import styles from '../../screens/ProductsList/ProductsList.module.css';
import type { ProductRow } from '../../types';
import EmptyState from '../EmptyState';
import { productColumns } from '../../columns';

type ProductsTableProps = {
  rows: ProductRow[];
  error: unknown;
  isLoading: boolean;
  hasProducts: boolean;
  refetch: () => void;
  onCreateProduct?: () => void;
};

export const ProductsTable = ({
  rows,
  error,
  isLoading,
  hasProducts,
  refetch,
  onCreateProduct,
}: ProductsTableProps) => {
  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus productos.</strong>

        <Button variant="outline" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasProducts && !isLoading) {
    return <EmptyState onCreateProduct={onCreateProduct} />;
  }

  return (
    <div className={styles.tableWrap}>
      <Table
        ariaLabel="Productos"
        columns={productColumns}
        rows={rows}
        pageSize={rows.length}
        selectionMode="multi"
        defaultSort={{ key: 'name', dir: 'asc' }}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingText="Cargando productos..."
        emptyText="No hay productos para mostrar"
      />

      <div className={styles.columnMenu} aria-hidden="true">
        <List size={16} />
      </div>
    </div>
  );
};
