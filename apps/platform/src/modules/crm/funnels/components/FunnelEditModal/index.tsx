import { useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import type { CrmFunnel } from '@hlb/contracts';
import { useCrmMutations } from '../../hooks';
import styles from './FunnelEditModal.module.css';

type FunnelEditModalProps = {
  funnel: CrmFunnel;
  closeModal: () => void;
};

export const FunnelEditModal = ({ funnel, closeModal }: FunnelEditModalProps) => {
  const { renameFunnel, isRenamingFunnel } = useCrmMutations();
  const [name, setName] = useState(funnel.name);
  const [description, setDescription] = useState(funnel.description ?? '');
  const [error, setError] = useState('');

  const save = async () => {
    if (!name.trim()) return setError('Ingresa el nombre del embudo.');
    try {
      await renameFunnel({
        funnelId: String(funnel.id),
        name: name.trim(),
        description: description.trim() || undefined,
      });
      closeModal();
    } catch (reason) {
      setError((reason as Error).message);
    }
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel="Editar embudo"
      className={styles.modal}
      size={{ width: '46rem', maxWidth: 'calc(100vw - 3.2rem)' }}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Header>
        <h2 className={styles.title}>Editar embudo</h2>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <TextInput label="Nombre del embudo" value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {error && <p className={styles.error}>{error}</p>}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <Button loading={isRenamingFunnel} onClick={() => void save()}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
