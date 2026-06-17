import { useRef } from 'react';
import { Modal } from '@hlb/design-system';
import { ServiceForm } from '../ServiceForm';
import styles from './CreateServiceModal.module.css';

type CreateServiceModalProps = {
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

export const CreateServiceModal = ({ closeModal, onSuccess, requestCloseModal }: CreateServiceModalProps) => {
  const dirtyRef = useRef(false);

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
      onConfirm: resetState,
    });
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel="Nuevo servicio"
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeStrategy="manual"
      closeOnOverlay
      closeOnEsc
      onClose={closeModal}
      onRequestClose={handleClose}
      size={{ width: '60rem', maxWidth: 'calc(100vw - 3.2rem)' }}
    >
      <Modal.Header className={styles.header}>
        <h2>Nuevo servicio</h2>
        <Modal.CloseButton onClick={handleClose} label="Cerrar" />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <ServiceForm
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
