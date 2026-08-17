import { useRef } from 'react';
import { Modal } from '@hlb/design-system';
import { CategoryForm } from '../ProductForm';
import styles from './CreateProductModal.module.css';
import type { CategoryRow } from '../../types';

type CreateCategoryModalProps = {
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
  initialCategory?: CategoryRow;
};

export const CreateCategoryModal = ({
  closeModal,
  requestCloseModal,
  onSuccess,
  initialCategory,
}: CreateCategoryModalProps) => {
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
      ariaLabel={initialCategory ? 'Editar categoría' : 'Nueva categoría'}
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
        <h2>{initialCategory ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <Modal.CloseButton onClick={handleClose} label="Cerrar" />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        <CategoryForm
          initialCategory={initialCategory}
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
