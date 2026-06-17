import { Button, Table } from '@hlb/design-system';
import { List } from 'lucide-react';
import { serviceColumns } from '../../columns';
import EmptyState from '../EmptyState';
import type { ServiceRow } from '../../types';
import styles from '../../screens/ServicesList/ServicesList.module.css';

type ServicesTableProps = {
  rows: ServiceRow[];
  error: unknown;
  isLoading: boolean;
  hasServices: boolean;
  refetch: () => void;
  onCreateService?: () => void;
};

export const ServicesTable = ({ rows, error, hasServices, isLoading, onCreateService, refetch }: ServicesTableProps) => {
  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus servicios.</strong>

        <Button variant="outline" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasServices && !isLoading) {
    return <EmptyState onCreateService={onCreateService} />;
  }

  return (
    <div className={styles.tableWrap}>
      <Table
        ariaLabel="Servicios"
        columns={serviceColumns()}
        rows={rows}
        pageSize={rows.length}
        selectionMode="multi"
        defaultSort={{ key: 'name', dir: 'asc' }}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingText="Cargando servicios..."
        emptyText="No hay servicios para mostrar"
      />

      <div className={styles.columnMenu} aria-hidden="true">
        <List size={16} />
      </div>
    </div>
  );
};
