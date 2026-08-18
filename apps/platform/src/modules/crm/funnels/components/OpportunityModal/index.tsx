import { useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import type { CrmFunnel } from '@hlb/contracts';
import { useCrmMutations } from '../../hooks';
import styles from './OpportunityModal.module.css';
export const OpportunityModal = ({
  funnel,
  initialStageId,
  closeModal,
}: {
  funnel: CrmFunnel;
  initialStageId: string;
  closeModal: () => void;
}) => {
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [value, setValue] = useState('0');
  const [stageId, setStageId] = useState(initialStageId);
  const [error, setError] = useState('');
  const { createOpportunity, isCreatingOpportunity } = useCrmMutations();
  const save = () => {
    if (!name.trim()) return setError('Ingresa el nombre de la oportunidad.');
    createOpportunity(
      {
        funnelId: String(funnel.id),
        payload: {
          name: name.trim(),
          contactName: contactName.trim(),
          value: Number(value),
          stageId: stageId as never,
          currency: 'COP',
          notes: '',
          status: 'open',
        },
      },
      { onSuccess: closeModal, onError: (reason: Error) => setError(reason.message) },
    );
  };
  return (
    <Modal.Window
      isOpen
      ariaLabel="Nueva oportunidad"
      size="md"
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
    >
      <Modal.Header>
        <h2>Nueva oportunidad</h2>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <TextInput
          label="Nombre *"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <TextInput
          label="Contacto"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
        />
        <TextInput
          label="Valor"
          type="number"
          min="0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <label>
          Etapa
          <select value={stageId} onChange={(event) => setStageId(event.target.value)}>
            {funnel.stages.map((stage) => (
              <option key={String(stage.id)} value={String(stage.id)}>
                {stage.name}
              </option>
            ))}
          </select>
        </label>
        {error && <p>{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" theme="optional" onClick={closeModal}>
          Cancelar
        </Button>
        <Button loading={isCreatingOpportunity} onClick={save}>
          Crear oportunidad
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
