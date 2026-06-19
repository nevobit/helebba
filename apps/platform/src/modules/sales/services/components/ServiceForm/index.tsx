import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { useCreateService } from '../../hooks';
import type { CreateServicePayload } from '../../services';
import styles from './ServiceForm.module.css';

export const SERVICE_FORM_ID = 'service-form';

type ServiceFormProps = {
  onDirtyChange?: (dirty: boolean) => void;
  onCancel: () => void;
  onSuccess?: () => void;
};

type ServiceFormState = {
  name: string;
  code: string;
  description: string;
  tags: string;
  salesChannelId: string;
  price: string;
  cost: string;
  timeInMinutes: string;
  tax: string;
};

const initialState: ServiceFormState = {
  name: '',
  code: '',
  description: '',
  tags: '',
  salesChannelId: '',
  price: '0',
  cost: '0',
  timeInMinutes: '',
  tax: '0',
};

const toNumber = (value: string) => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const ServiceForm = ({ onCancel, onDirtyChange, onSuccess }: ServiceFormProps) => {
  const [formState, setFormState] = useState<ServiceFormState>(initialState);
  const [showDescription, setShowDescription] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createService, isCreatingService } = useCreateService();

  const price = toNumber(formState.price);
  const tax = toNumber(formState.tax);
  const total = useMemo(() => price + price * (tax / 100), [price, tax]);

  const markDirty = () => onDirtyChange?.(true);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setError(null);
    markDirty();
  };

  const buildPayload = (): CreateServicePayload => ({
    name: formState.name.trim(),
    code: formState.code.trim(),
    description: formState.description.trim(),
    tags: splitList(formState.tags),
    salesChannelId: formState.salesChannelId,
    price,
    cost: toNumber(formState.cost),
    timeInMinutes: toNumber(formState.timeInMinutes),
    tax,
    total,
    color: '#4ade80',
    duration: formState.timeInMinutes ? `${formState.timeInMinutes} min` : '',
    archived: false,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      setError('Ingresa el nombre del servicio.');
      return;
    }

    createService(buildPayload(), {
      onSuccess: () => {
        onDirtyChange?.(false);
        onSuccess?.();
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos crear el servicio.');
      },
    });
  };

  return (
    <form id={SERVICE_FORM_ID} className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.grid}>
        <TextInput
          className={styles.nameField}
          label="Nombre"
          name="name"
          value={formState.name}
          error={error ?? undefined}
          disabled={isCreatingService}
          autoFocus
          onChange={updateField}
        />
        <TextInput
          label="Código"
          name="code"
          value={formState.code}
          disabled={isCreatingService}
          onChange={updateField}
        />

        {!showDescription ? (
          <button className={styles.linkButton} type="button" onClick={() => setShowDescription(true)}>
            + Añadir una descripción
          </button>
        ) : (
          <label className={styles.textareaField}>
            <span>Descripción</span>
            <textarea
              name="description"
              value={formState.description}
              disabled={isCreatingService}
              onChange={updateField}
            />
          </label>
        )}

        <TextInput
          label="Tags"
          name="tags"
          placeholder="Tags"
          value={formState.tags}
          disabled={isCreatingService}
          onChange={updateField}
        />
        <label className={styles.selectField}>
          <span>Cuenta de ventas</span>
          <select
            name="salesChannelId"
            value={formState.salesChannelId}
            disabled={isCreatingService}
            onChange={updateField}
          >
            <option value="">Seleccionar cuenta</option>
            <option value="No asignado">No asignado</option>
          </select>
        </label>

        <TextInput
          label="Precio / unidad"
          name="price"
          value={formState.price}
          disabled={isCreatingService}
          onChange={updateField}
        />
        <TextInput
          label="Coste / unidad"
          name="cost"
          value={formState.cost}
          disabled={isCreatingService}
          onChange={updateField}
        />

        {!showTime ? (
          <button className={styles.linkButton} type="button" onClick={() => setShowTime(true)}>
            + Añadir tiempo
          </button>
        ) : (
          <TextInput
            className={styles.fullField}
            label="Tiempo"
            name="timeInMinutes"
            value={formState.timeInMinutes}
            suffix="min"
            disabled={isCreatingService}
            onChange={updateField}
          />
        )}

        <label className={styles.taxField}>
          <span>Impuestos de venta</span>
          <strong>IVA {formState.tax}%</strong>
        </label>
        <TextInput label="Total" name="total" value={String(total)} disabled readOnly />
      </div>

      <footer className={styles.footer}>
        <Button variant="outline" theme="optional" size="medium" disabled={isCreatingService} onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="medium" loading={isCreatingService}>
          Crear
        </Button>
      </footer>
    </form>
  );
};
