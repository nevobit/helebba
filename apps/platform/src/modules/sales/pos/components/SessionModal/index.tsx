import { useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import type { PosCashRegister } from '@hlb/contracts';
import { usePosTransactions } from '../../hooks';

export const SessionModal = ({
  storeId,
  register,
  mode,
  closeModal,
}: {
  storeId: string;
  register: PosCashRegister;
  mode: 'open' | 'close';
  closeModal: () => void;
}) => {
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');
  const { openSession, closeSession, isOpening, isClosing } = usePosTransactions();
  const save = () => {
    const amount = Number(balance);
    if (!Number.isFinite(amount) || amount < 0) return setError('Ingresa un saldo válido.');
    const options = { onSuccess: closeModal, onError: (reason: Error) => setError(reason.message) };
    if (mode === 'open')
      openSession({ storeId, registerId: String(register.id), openingBalance: amount }, options);
    else
      closeSession({ storeId, registerId: String(register.id), closingBalance: amount }, options);
  };
  return (
    <Modal.Window
      isOpen
      ariaLabel={mode === 'open' ? 'Abrir caja' : 'Cerrar caja'}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
      size="sm"
    >
      <Modal.Header>
        <h2>
          {mode === 'open' ? 'Abrir' : 'Cerrar'} {register.name}
        </h2>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body>
        <p>
          {mode === 'open'
            ? 'Indica el efectivo disponible al iniciar el turno.'
            : 'Cuenta el efectivo de la caja e indica el saldo final.'}
        </p>
        <TextInput
          label={mode === 'open' ? 'Saldo inicial' : 'Saldo final'}
          type="number"
          min="0"
          step="0.01"
          value={balance}
          onChange={(event) => setBalance(event.target.value)}
        />
        {error && <p style={{ color: '#b42318' }}>{error}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" theme="optional" onClick={closeModal}>
          Cancelar
        </Button>
        <Button loading={isOpening || isClosing} onClick={save}>
          {mode === 'open' ? 'Abrir caja' : 'Cerrar caja'}
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
