import { Button, Table } from '@hlb/design-system';
import { List } from 'lucide-react';
import styles from '../../screens/ContactsList/ContactsList.module.css';
import type { ContactRow } from '../../types';
import EmptyState from '../EmptyState';
import { contactColumns } from '../../columns';

type ContactsTableProps = {
  rows: ContactRow[];
  error: unknown;
  isLoading: boolean;
  hasContacts: boolean;
  refetch: () => void;
  onCreateContact?: () => void;
  onSelectContact?: (contact: ContactRow) => void;
  selectedContactId?: string | null;
};

export const ContactsTable = ({
  rows,
  error,
  isLoading,
  hasContacts,
  refetch,
  onCreateContact,
  onSelectContact,
  selectedContactId,
}: ContactsTableProps) => {
  if (error) {
    return (
      <div className={styles.feedback} role="alert">
        <strong>No pudimos cargar tus contactos.</strong>

        <Button variant="outline" size="medium" onClick={refetch}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!hasContacts && !isLoading) {
    return <EmptyState onCreateContact={onCreateContact} />;
  }

  return (
    <div className={styles.tableWrap}>
      <Table
        ariaLabel="Contactos"
        columns={contactColumns}
        rows={rows}
        pageSize={rows.length}
        selectionMode="multi"
        defaultSort={{ key: 'name', dir: 'asc' }}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        loadingText="Cargando contactos..."
        emptyText="No hay contactos para mostrar"
        activeRowKey={selectedContactId}
        onRowClick={onSelectContact}
      />

      <div className={styles.columnMenu} aria-hidden="true">
        <List size={16} />
      </div>
    </div>
  );
};
