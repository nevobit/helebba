import { useState } from 'react';
import { Button, Modal } from '@hlb/design-system';
import styles from './ConfirmDialog.module.css';

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
  closeModal: () => void;
};

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  closeModal,
}: ConfirmDialogProps) => {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setPending(true);
    try {
      await onConfirm();
      closeModal();
    } catch (reason) {
      setError((reason as Error).message);
      setPending(false);
    }
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel={title}
      className={styles.modal}
      size={{ width: '42rem', maxWidth: 'calc(100vw - 3.2rem)' }}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Header>
        <h2 className={styles.title}>{title}</h2>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <p>{message}</p>
        {error && <p className={styles.error}>{error}</p>}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <Button variant="outline" theme="optional" onClick={closeModal}>
          Cancelar
        </Button>
        <Button tone="critical" loading={pending} onClick={() => void confirm()}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
