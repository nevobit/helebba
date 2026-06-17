import { useRef } from 'react';
import { Modal } from '@hlb/design-system';
import { WarehouseForm } from '../WarehouseForm';
import styles from './CreateWarehouseModal.module.css';

type CreateWarehouseModalProps = {
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

export const CreateWarehouseModal = ({ closeModal, requestCloseModal, onSuccess }: CreateWarehouseModalProps) => {
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
      ariaLabel="Nuevo almacén"
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeStrategy="manual"
      closeOnOverlay
      closeOnEsc
      onClose={closeModal}
      onRequestClose={handleClose}
      size={{ width: '90rem', maxWidth: 'calc(100vw - 3.2rem)' }}
    >
      <Modal.Header className={styles.header}>
        <h2>Nuevo almacén</h2>
        <Modal.CloseButton onClick={handleClose} label="Cerrar" />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <WarehouseForm
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
