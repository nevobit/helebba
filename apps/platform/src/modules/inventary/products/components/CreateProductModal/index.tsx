import { useRef } from 'react';
import { Modal } from '@hlb/design-system';
import { ProductForm } from '../ProductForm';
import styles from './CreateProductModal.module.css';

type CreateProductModalProps = {
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

export const CreateProductModal = ({
  closeModal,
  requestCloseModal,
  onSuccess,
}: CreateProductModalProps) => {
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
      ariaLabel="Nuevo producto"
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeStrategy="manual"
      closeOnOverlay
      closeOnEsc
      onClose={closeModal}
      onRequestClose={handleClose}
      size={{ width: '128rem', maxWidth: 'calc(100vw - 4.8rem)' }}
    >
      <Modal.Header className={styles.header}>
        <h2>Nuevo producto</h2>
        <Modal.CloseButton onClick={handleClose} />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <ProductForm
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
