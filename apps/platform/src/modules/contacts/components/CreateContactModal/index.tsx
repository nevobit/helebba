import { useRef } from 'react';
import { Modal } from '@hlb/design-system';
import { ContactForm } from '../ContactForm';
import type { ContactRow } from '../../types';
import styles from './CreateContactModal.module.css';

type CreateContactModalProps = {
  contact?: ContactRow;
  closeModal: () => void;
  requestCloseModal: (options: {
    confirm: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
  }) => void;
  onSuccess?: () => void;
};

export const CreateContactModal = ({
  contact,
  closeModal,
  requestCloseModal,
  onSuccess,
}: CreateContactModalProps) => {
  const dirtyRef = useRef(false);
  const isEditing = Boolean(contact);

  const resetState = () => {
    dirtyRef.current = false;
  };

  const handleClose = () => {
    requestCloseModal({
      confirm: dirtyRef.current,
      title: 'Descartar cambios',
      description: 'Perderás cambios no guardados. ¿Continuar?',
      confirmLabel: 'Sí, cerrar',
      cancelLabel: 'Seguir editando',
      onConfirm: () => {
        resetState();
      },
    });
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel={isEditing ? 'Editar contacto' : 'Nuevo contacto'}
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeStrategy="manual"
      closeOnOverlay
      closeOnEsc
      onClose={closeModal}
      onRequestClose={handleClose}
      size={{ width: '90rem', maxWidth: 'calc(100vw - 4rem)' }}
    >
      <Modal.Header className={styles.header}>
        <h2>{isEditing ? 'Editar contacto' : 'Nuevo contacto'}</h2>
        <Modal.CloseButton onClick={handleClose} />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <ContactForm
          contact={contact}
          onCancel={handleClose}
          onDirtyChange={(dirty) => {
            dirtyRef.current = dirty;
          }}
          onSuccess={() => {
            resetState();
            closeModal();
            onSuccess?.();
          }}
        />
      </Modal.Body>
    </Modal.Window>
  );
};
