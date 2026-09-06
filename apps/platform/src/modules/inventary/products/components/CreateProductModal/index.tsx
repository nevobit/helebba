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
  duplicateProductId?: string;
};

export const CreateProductModal = ({
  closeModal,
  requestCloseModal,
  onSuccess,
  productId,
  duplicateProductId,
}: CreateProductModalProps) => {
  const dirtyRef = useRef(false);
  const sourceProductId = productId ?? duplicateProductId;
  const { product, error, isLoading } = useProduct(sourceProductId);
  const isEditing = Boolean(productId);
  const isDuplicating = Boolean(duplicateProductId);
  const requiresProduct = isEditing || isDuplicating;
  const title = isEditing
    ? 'Editar producto'
    : isDuplicating
      ? 'Duplicar producto'
      : 'Nuevo producto';

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
      ariaLabel={title}
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
        <h2>{title}</h2>
        <Modal.CloseButton onClick={handleClose} />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {requiresProduct && isLoading ? (
          <p>Cargando producto...</p>
        ) : requiresProduct && (error || !product) ? (
          <p role="alert">No pudimos cargar el producto.</p>
        ) : (
          <ProductForm
            initialProduct={product}
            mode={isEditing ? 'edit' : isDuplicating ? 'duplicate' : 'create'}
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
