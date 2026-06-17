import { Button, Table } from '@hlb/design-system';
import { List } from 'lucide-react';
import { documentColumns } from '../../columns';
import { EmptyState } from '../EmptyState';
import type { DocumentConfig, DocumentRow } from '../../types';
import styles from '../../screens/DocumentList/DocumentList.module.css';

type DocumentsTableProps = {
  rows: DocumentRow[];
  error: unknown;
  isLoading: boolean;
  hasDocuments: boolean;
  selectedId?: string | null;
  config: DocumentConfig;
  refetch: () => void;
  onEditDocument: (row: DocumentRow) => void;
  onOpenDocument: (row: DocumentRow) => void;
};

export const DocumentsTable = ({
  config,
  error,
  hasDocuments,
  isLoading,
  onEditDocument,
  onOpenDocument,
  refetch,
  rows,
  selectedId,
}: DocumentsTableProps) => {
  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus documentos.</strong>
        <Button variant="outline" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasDocuments && !isLoading) {
    return <EmptyState config={config} />;
  }

  return (
    <div className={styles.tableWrap}>
      <Table
        ariaLabel={config.title}
        columns={documentColumns({ onEdit: onEditDocument, onOpen: onOpenDocument })}
        rows={rows}
        pageSize={rows.length}
        selectionMode="multi"
        defaultSort={{ key: 'date', dir: 'desc' }}
        getRowKey={(row) => row.id}
        activeRowKey={selectedId}
        onRowClick={onOpenDocument}
        isLoading={isLoading}
        loadingText="Cargando documentos..."
        emptyText="No hay documentos para mostrar"
      />

      <div className={styles.columnMenu} aria-hidden="true">
        <List size={16} />
      </div>
    </div>
  );
};
