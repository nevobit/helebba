import { useRef } from 'react';
import { Modal } from '@hlb/design-system';
import { ProductForm } from '../ProductForm';
import styles from './CreateProductModal.module.css';
import { useProduct } from '../../hooks';

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
  productId?: string;
};

export const CreateProductModal = ({
  closeModal,
  requestCloseModal,
  onSuccess,
  productId,
}: CreateProductModalProps) => {
  const dirtyRef = useRef(false);
  const { product, error, isLoading } = useProduct(productId);
  const isEditing = Boolean(productId);

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
      ariaLabel={isEditing ? 'Editar producto' : 'Nuevo producto'}
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
        <h2>{isEditing ? 'Editar producto' : 'Nuevo producto'}</h2>
        <Modal.CloseButton onClick={handleClose} />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {isEditing && isLoading ? (
          <p>Cargando producto...</p>
        ) : isEditing && (error || !product) ? (
          <p role="alert">No pudimos cargar el producto.</p>
        ) : (
          <ProductForm
            initialProduct={product}
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
        )}
      </Modal.Body>
    </Modal.Window>
  );
};
