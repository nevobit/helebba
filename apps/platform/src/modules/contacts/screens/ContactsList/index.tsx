import { useCallback, useState } from 'react';
import styles from './ContactsList.module.css';
import { ContactDetailsDrawer, ContactsTable, Header, Pagination, Toolbar } from '../../components';
import { useContactsListController, useCreateContactModal, useDeleteContact } from '../../hooks';
import type { ContactRow } from '../../types';
import { useModal } from '@hlb/design-system';

const PAGE_TITLE = 'Contactos - Helebba';

const ContactsList = () => {
  const controller = useContactsListController();
  const { openCreateContactModal } = useCreateContactModal();
  const { deleteContact, isDeletingContact } = useDeleteContact();
  const { requestCloseModal } = useModal();

  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null);

  const refreshContacts = useCallback(() => {
    controller.refetch();
  }, [controller]);

  const openContactModal = () => openCreateContactModal({ onSuccess: refreshContacts });
  const editContact = (contact: ContactRow) => {
    openCreateContactModal({
      contact,
      onSuccess: () => {
        setSelectedContact(null);
        refreshContacts();
      },
    });
  };

  const closeDetailsDrawer = useCallback(() => {
    setSelectedContact(null);
  }, []);

  const removeContact = useCallback(
    (contact: ContactRow) => {
      if (isDeletingContact) return;

      requestCloseModal({
        confirm: true,
        title: 'Eliminar contacto',
        description: `Esta acción eliminará el contacto "${contact.name}". Esta operación no se puede deshacer.`,
        confirmLabel: 'Eliminar contacto',
        cancelLabel: 'Cancelar',
        onConfirm: () => {
          deleteContact(contact.id, {
            onSuccess: () => {
              closeDetailsDrawer();
              refreshContacts();
            },
          });
        },
      });
    },
    [closeDetailsDrawer, deleteContact, isDeletingContact, refreshContacts, requestCloseModal],
  );

  return (
    <main className={styles.page}>
      <title>{PAGE_TITLE}</title>

      <Header onContactCreated={refreshContacts} />

      <section className={styles.panel} aria-label="Listado de contactos">
        <Toolbar
          activeScope={controller.activeScope}
          query={controller.query}
          onScopeChange={controller.changeScope}
          onQueryChange={controller.changeQuery}
        />

        <ContactsTable
          rows={controller.rows}
          error={controller.error}
          isLoading={controller.isLoading}
          hasContacts={controller.hasContacts}
          refetch={controller.refetch}
          onCreateContact={openContactModal}
          onSelectContact={setSelectedContact}
          selectedContactId={selectedContact?.id}
        />

        {controller.showPagination && (
          <Pagination
            page={controller.page}
            pageInfo={controller.pageInfo}
            pageSize={controller.pageSize}
            total={controller.total}
            startItem={controller.startItem}
            endItem={controller.endItem}
            onPageChange={controller.setPage}
            onPageSizeChange={controller.changePageSize}
          />
        )}
      </section>

      <ContactDetailsDrawer
        contact={selectedContact}
        isDeleting={isDeletingContact}
        onClose={() => setSelectedContact(null)}
        onDelete={removeContact}
        onEdit={editContact}
      />
    </main>
  );
};

export default ContactsList;
