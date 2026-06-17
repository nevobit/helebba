import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { Warehouse as WarehouseIcon } from 'lucide-react';
import { useCreateWarehouse } from '../../hooks';
import type { CreateWarehousePayload } from '../../services';
import styles from './WarehouseForm.module.css';

export const WAREHOUSE_FORM_ID = 'warehouse-form';

type WarehouseFormProps = {
  onDirtyChange?: (dirty: boolean) => void;
  onCancel: () => void;
  onSuccess?: () => void;
};

type WarehouseFormState = {
  name: string;
  email: string;
  phone: string;
  mobile: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  country: string;
  accountingAccount: string;
  icon: string;
  color: string;
  isDefault: boolean;
};

const initialState: WarehouseFormState = {
  name: '',
  email: '',
  phone: '',
  mobile: '',
  address: '',
  city: '',
  postalCode: '',
  province: '',
  country: '',
  accountingAccount: '',
  icon: 'warehouse',
  color: '#c90edb',
  isDefault: false,
};

export const WarehouseForm = ({ onCancel, onDirtyChange, onSuccess }: WarehouseFormProps) => {
  const [formState, setFormState] = useState<WarehouseFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const { createWarehouse, isCreatingWarehouse } = useCreateWarehouse();

  const markDirty = () => onDirtyChange?.(true);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setError(null);
    markDirty();
  };

  const updateCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = event.target;
    setFormState((current) => ({ ...current, [name]: checked }));
    markDirty();
  };

  const buildPayload = (): CreateWarehousePayload => ({
    name: formState.name.trim(),
    email: formState.email.trim(),
    phone: formState.phone.trim(),
    mobile: formState.mobile.trim(),
    color: formState.color,
    icon: formState.icon,
    isDefault: formState.isDefault,
    accountingAccount: formState.accountingAccount.trim(),
    productsCount: 0,
    totalStock: 0,
    postalCode: formState.postalCode.trim(),
    address: {
      address: formState.address.trim(),
      city: formState.city.trim(),
      postalCode: Number(formState.postalCode) || 0,
      province: formState.province.trim(),
      country: formState.country.trim(),
      countryCode: formState.country === 'Colombia' ? 'CO' : '',
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      setError('Ingresa el nombre del almacén.');
      return;
    }

    createWarehouse(buildPayload(), {
      onSuccess: () => {
        onDirtyChange?.(false);
        onSuccess?.();
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos crear el almacén.');
      },
    });
  };

  return (
    <form id={WAREHOUSE_FORM_ID} className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.columns}>
        <section className={styles.section}>
          <h3>Almacén</h3>
          <div className={styles.fieldBox}>
            <TextInput
              className={styles.fullField}
              label="Nombre"
              name="name"
              value={formState.name}
              error={error ?? undefined}
              disabled={isCreatingWarehouse}
              autoFocus
              onChange={updateField}
            />
            <TextInput
              className={styles.fullField}
              label="Email"
              name="email"
              type="email"
              value={formState.email}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            />
            <TextInput
              className={styles.fieldCell}
              label="Teléfono"
              name="phone"
              value={formState.phone}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            />
            <TextInput
              className={styles.fieldCell}
              label="Móvil"
              name="mobile"
              value={formState.mobile}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            />
          </div>

          <div className={styles.inlineFields}>
            <label className={styles.selectPill}>
              <span>Icono</span>
              <select name="icon" value={formState.icon} disabled={isCreatingWarehouse} onChange={updateField}>
                <option value="warehouse">Almacén</option>
                <option value="store">Tienda</option>
                <option value="building">Edificio</option>
              </select>
              <WarehouseIcon size={16} />
            </label>
            <label className={styles.colorPill}>
              <span>Color</span>
              <input type="color" name="color" value={formState.color} disabled={isCreatingWarehouse} onChange={updateField} />
              <strong>{formState.color}</strong>
            </label>
          </div>

          <label className={styles.checkboxField}>
            <input
              type="checkbox"
              name="isDefault"
              checked={formState.isDefault}
              disabled={isCreatingWarehouse}
              onChange={updateCheckbox}
            />
            Marcar como almacén principal
          </label>
        </section>

        <section className={styles.section}>
          <h3>Dirección</h3>
          <div className={styles.fieldBox}>
            <TextInput
              className={styles.fullField}
              label="Dirección"
              name="address"
              value={formState.address}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            />
            <TextInput
              className={styles.fieldCell}
              label="Población"
              name="city"
              value={formState.city}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            />
            <TextInput
              className={styles.fieldCell}
              label="Código postal"
              name="postalCode"
              value={formState.postalCode}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            />
            <TextInput
              className={styles.fieldCell}
              label="Provincia"
              name="province"
              value={formState.province}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            />
            <label>
              <span>País</span>
              <select name="country" value={formState.country} disabled={isCreatingWarehouse} onChange={updateField}>
                <option value="">Elige</option>
                <option value="Colombia">Colombia</option>
                <option value="España">España</option>
                <option value="México">México</option>
              </select>
            </label>
          </div>
          <label className={styles.accountField}>
            <span>Cuenta contable</span>
            <select
              name="accountingAccount"
              value={formState.accountingAccount}
              disabled={isCreatingWarehouse}
              onChange={updateField}
            >
              <option value="">Seleccionar cuenta</option>
            </select>
          </label>
        </section>
      </div>

      <footer className={styles.footer}>
        <span>No puedes eliminar al almacén principal</span>
        <Button type="button" variant="outline" theme="optional" size="medium" disabled={isCreatingWarehouse} onClick={onCancel}>
          Descartar
        </Button>
        <Button type="submit" size="medium" loading={isCreatingWarehouse}>
          Crear
        </Button>
      </footer>
    </form>
  );
};
