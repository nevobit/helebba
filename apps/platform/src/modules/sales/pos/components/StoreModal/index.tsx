import { useState } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import type { WarehouseId } from '@hlb/contracts';
import { useWarehouses } from '@/modules/inventary/warehouses/hooks';
import { usePosMutations } from '../../hooks';
import styles from './StoreModal.module.css';

export const StoreModal = ({ closeModal }: { closeModal: () => void }) => {
  const { warehouses, isLoading } = useWarehouses({ page: 1, limit: 100, search: '' });
  const defaultWarehouse = warehouses.find((warehouse) => warehouse.isDefault);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [error, setError] = useState('');
  const { createStore, isCreatingStore } = usePosMutations();
  const selectedWarehouse = warehouseId || String(defaultWarehouse?.id ?? '');
  const save = () => {
    if (!name.trim()) return setError('Ingresa el nombre de la tienda.');
    if (!address.trim()) return setError('Ingresa la dirección de la tienda.');
    if (!selectedWarehouse) return setError('Selecciona una bodega.');
    createStore(
      {
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim() || undefined,
        warehouseId: selectedWarehouse as WarehouseId,
      },
      { onSuccess: closeModal, onError: (reason: Error) => setError(reason.message) },
    );
  };
  return (
    <Modal.Window
      isOpen
      ariaLabel="Crear tienda"
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
      size="md"
    >
      <Modal.Header>
        <h2>Crear tienda</h2>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Body className={styles.body}>
        <div className={styles.notice}>
          <strong>Esta acción puede afectar tu suscripción</strong>
          <span>La facturación del POS puede depender del número de tiendas activas.</span>
        </div>
        <p>Crea el perfil de tu tienda y selecciona una bodega para controlar el stock.</p>
        <TextInput
          label="Nombre de la tienda *"
          placeholder="Escribe el nombre de tu tienda"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          label="Dirección de la tienda *"
          placeholder="Escribe la dirección de tu tienda"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <label className={styles.field}>
          <span>Bodega</span>
          <select
            value={selectedWarehouse}
            disabled={isLoading}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            <option value="">Selecciona una bodega</option>
            {warehouses.map((warehouse) => (
              <option key={String(warehouse.id)} value={String(warehouse.id)}>
                {warehouse.name}
                {warehouse.isDefault ? ' (predeterminada)' : ''}
              </option>
            ))}
          </select>
        </label>
        <TextInput
          label="Número de teléfono (opcional)"
          placeholder="Número que aparecerá en los recibos"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {error && <p className={styles.error}>{error}</p>}
      </Modal.Body>
      <Modal.Footer className={styles.footer}>
        <Button variant="outline" theme="optional" onClick={closeModal}>
          Cancelar
        </Button>
        <Button loading={isCreatingStore} onClick={save}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal.Window>
  );
};
