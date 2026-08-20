import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Modal, TextInput } from '@hlb/design-system';
import { Plus } from 'lucide-react';
import type { PriceList } from '@hlb/contracts';
import { useCreatePriceList, usePriceLists } from '../../hooks';
import type { CreatePriceListPayload } from '../../services';
import styles from './TariffManagerModal.module.css';

type TariffManagerModalProps = {
  closeModal: () => void;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export const TariffManagerModal = ({ closeModal, selectedIds, onChange }: TariffManagerModalProps) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const { priceLists, isLoading, refetch } = usePriceLists();
  const { createPriceList, isCreatingPriceList } = useCreatePriceList();

  const toggleTariff = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    setSelected(next);
    onChange(next);
  };

  const handleSaved = () => {
    void refetch();
    setView('list');
  };

  return (
    <Modal.Window
      isOpen
      ariaLabel="Gestionar tarifas"
      className={styles.modal}
      closeOnEsc
      closeOnOverlay
      onClose={closeModal}
      size={{ width: '60rem', maxWidth: 'calc(100vw - 3.2rem)' }}
    >
      <Modal.Header>
        <h2>{view === 'list' ? 'Tarifas' : 'Nueva tarifa'}</h2>
        <Modal.CloseButton onClick={closeModal} label="Cerrar" />
      </Modal.Header>

      <Modal.Body className={styles.body}>
        {view === 'list' ? (
          <section className={styles.list} aria-label="Tarifas existentes">
            {isLoading ? (
              <p className={styles.empty}>Cargando tarifas...</p>
            ) : priceLists.length > 0 ? (
              <ul className={styles.items}>
                {priceLists.map((priceList) => (
                  <TariffItem
                    key={String(priceList.id)}
                    priceList={priceList}
                    checked={selected.includes(String(priceList.id))}
                    onToggle={() => toggleTariff(String(priceList.id))}
                  />
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <strong>Aún no hay tarifas</strong>
                <p>Crea tu primera tarifa para gestionar listas de precios.</p>
              </div>
            )}
          </section>
        ) : (
          <TariffForm
            isSaving={isCreatingPriceList}
            onSave={(payload) =>
              createPriceList(payload, {
                onSuccess: handleSaved,
              })
            }
          />
        )}
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        {view === 'list' ? (
          <>
            <Button variant="outline" theme="optional" onClick={closeModal}>
              Cerrar
            </Button>
            <Button icon={<Plus size={16} />} onClick={() => setView('form')}>
              Nueva tarifa
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" theme="optional" onClick={() => setView('list')}>
              Cancelar
            </Button>
            <Button type="submit" form={TARIFF_FORM_ID} loading={isCreatingPriceList}>
              Guardar
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal.Window>
  );
};

const TARIFF_FORM_ID = 'tariff-form';

const TariffItem = ({
  priceList,
  checked,
  onToggle,
}: {
  priceList: PriceList;
  checked: boolean;
  onToggle: () => void;
}) => (
  <li className={styles.item}>
    <label className={styles.itemLabel}>
      <input
        type="checkbox"
        className={styles.checkbox}
        checked={checked}
        onChange={onToggle}
      />
      <span className={styles.itemInfo}>
        <strong>{priceList.name}</strong>
        <span>{priceList.currency || 'COP'}</span>
      </span>
    </label>
    <p>{priceList.description || 'Sin descripción'}</p>
  </li>
);

const TariffForm = ({
  isSaving,
  onSave,
}: {
  isSaving: boolean;
  onSave: (payload: CreatePriceListPayload) => void;
}) => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('COP');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      setError('Ingresa el nombre de la tarifa.');
      return;
    }

    onSave({ name: name.trim(), currency: currency.trim() || 'COP', description: description.trim() });
  };

  const updateName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setError(null);
  };

  const updateCurrency = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrency(event.target.value);
    setError(null);
  };

  const updateDescription = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);
    setError(null);
  };

  return (
    <form id={TARIFF_FORM_ID} className={styles.form} onSubmit={handleSubmit}>
      <TextInput
        label="Nombre *"
        name="name"
        placeholder="Ej. Tarifa mayorista"
        value={name}
        error={error ?? undefined}
        disabled={isSaving}
        autoFocus
        onChange={updateName}
      />

      <TextInput
        label="Moneda"
        name="currency"
        placeholder="COP"
        value={currency}
        disabled={isSaving}
        onChange={updateCurrency}
      />

      <label className={styles.textareaField}>
        <span>Descripción</span>
        <textarea
          name="description"
          placeholder="Describe el uso de esta tarifa"
          value={description}
          disabled={isSaving}
          onChange={updateDescription}
        />
      </label>
    </form>
  );
};