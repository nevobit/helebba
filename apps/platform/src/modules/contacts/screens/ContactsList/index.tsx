import { useState } from 'react';
import styles from './ContactsList.module.css';
import { ContactDetailsDrawer, ContactsTable, Header, Pagination, Toolbar } from '../../components';
import { useContactsListController, useCreateContactModal, useDeleteContact } from '../../hooks';
import type { ContactRow } from '../../types';

const ContactsList = () => {
  const controller = useContactsListController();
  const { openCreateContactModal } = useCreateContactModal();
  const { deleteContact, isDeletingContact } = useDeleteContact();
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null);
  const refreshContacts = () => controller.refetch();
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
  const removeContact = (contact: ContactRow) => {
    if (isDeletingContact) return;

    const confirmed = window.confirm(`¿Eliminar el contacto "${contact.name}"?`);

    if (!confirmed) return;

    deleteContact(contact.id, {
      onSuccess: () => {
        setSelectedContact(null);
        refreshContacts();
      },
      onError: (err) => {
        window.alert(err instanceof Error ? err.message : 'No pudimos eliminar el contacto.');
      },
    });
  };

  return (
    <main className={styles.page}>
      <title>Contactos - Helebba</title>

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
