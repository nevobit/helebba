import { Button, Table } from '@hlb/design-system';
import { List } from 'lucide-react';
import styles from '../../screens/BrandsList/BrandsList.module.css';
import type { BrandRow } from '../../types';
import EmptyState from '../EmptyState';
import { brandColumns } from '../../columns';

type BrandsTableProps = {
  rows: BrandRow[];
  error: unknown;
  isLoading: boolean;
  hasBrands: boolean;
  refetch: () => void;
  onCreateBrand?: () => void;
};

export const BrandsTable = ({ rows, error, isLoading, hasBrands, refetch, onCreateBrand }: BrandsTableProps) => {
  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus marcas.</strong>

        <Button variant="outline" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasBrands && !isLoading) {
    return <EmptyState onCreateBrand={onCreateBrand} />;
  }

  return (
    <div className={styles.tableWrap}>
      <Table
        ariaLabel="Marcas"
        columns={brandColumns()}
        rows={rows}
        pageSize={rows.length}
        selectionMode="multi"
        defaultSort={{ key: 'name', dir: 'asc' }}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingText="Cargando marcas..."
        emptyText="No hay marcas para mostrar"
      />

      <div className={styles.columnMenu} aria-hidden="true">
        <List size={16} />
      </div>
    </div>
  );
};
