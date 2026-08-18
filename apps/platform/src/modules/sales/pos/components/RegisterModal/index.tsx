import { useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import { usePosMutations } from '../../hooks';
import styles from './RegisterModal.module.css';
export const RegisterModal = ({
  storeId,
  storeName,
  closeModal,
}: {
  storeId: string;
  storeName: string;
  closeModal: () => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { addRegister, isAddingRegister } = usePosMutations();
  const save = () => {
    if (!name.trim()) return setError('Ingresa el nombre de la caja registradora.');
    addRegister(
      {
        storeId,
        payload: { name: name.trim(), description: description.trim(), paymentMethodIds: [] },
      },
      { onSuccess: closeModal, onError: (reason: Error) => setError(reason.message) },
    );
  };
  return (
    <Modal.Window
      isOpen
      ariaLabel="Añadir caja registradora"
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
      size="md"
    >
      <Modal.Header>
        <h2>Añadir caja registradora</h2>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <TextInput
          label="Nombre de la caja registradora *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          label={`Descripción (opcional) · ${description.length}/50`}
          maxLength={50}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <h3>Métodos de pago</h3>
        <div className={styles.payment}>
          <strong>Cuenta de efectivo</strong>
          <span>{storeName} - Efectivo</span>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <Button variant="outline" theme="optional" onClick={closeModal}>
          Cancelar
        </Button>
        <Button loading={isAddingRegister} onClick={save}>
          Añadir
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
