import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { Upload } from 'lucide-react';
import { useCreateBrand } from '../../hooks';
import type { CreateBrandPayload } from '../../services';
import styles from './BrandForm.module.css';

export const BRAND_FORM_ID = 'brand-form';

type BrandFormProps = {
  onDirtyChange?: (dirty: boolean) => void;
  onCancel: () => void;
  onSuccess?: () => void;
};

type BrandFormState = {
  name: string;
  description: string;
  website: string;
  color: string;
};

const initialState: BrandFormState = {
  name: '',
  description: '',
  website: '',
  color: '#24485a',
};

const suggestions = [
  { name: 'Nike', color: '#111827' },
  { name: 'Adidas', color: '#2563eb' },
  { name: 'Apple', color: '#6b7280' },
  { name: 'Samsung', color: '#1d4ed8' },
];

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const BrandForm = ({ onCancel, onDirtyChange, onSuccess }: BrandFormProps) => {
  const [formState, setFormState] = useState<BrandFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const { createBrand, isCreatingBrand } = useCreateBrand();

  const markDirty = () => onDirtyChange?.(true);

  const updateField = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
    setError(null);
    markDirty();
  };

  const selectSuggestion = (name: string, color: string) => {
    setFormState((current) => ({ ...current, name: current.name || name, color }));
    setError(null);
    markDirty();
  };

  const buildPayload = (): CreateBrandPayload => ({
    name: formState.name.trim(),
    slug: slugify(formState.name),
    description: formState.description.trim(),
    website: formState.website.trim() || undefined,
    color: formState.color,
    logoUrl: '',
    position: 0,
    parentId: null,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      setError('Ingresa el nombre de la marca.');
      return;
    }

    createBrand(buildPayload(), {
      onSuccess: () => {
        onDirtyChange?.(false);
        onSuccess?.();
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos crear la marca.');
      },
    });
  };

  return (
    <form id={BRAND_FORM_ID} className={styles.form} onSubmit={handleSubmit}>
      <TextInput
        label="Nombre"
        name="name"
        value={formState.name}
        error={error ?? undefined}
        disabled={isCreatingBrand}
        autoFocus
        onChange={updateField}
      />

      <TextInput
        label="Sitio web"
        name="website"
        placeholder="https://"
        value={formState.website}
        disabled={isCreatingBrand}
        onChange={updateField}
      />

      <label className={styles.textareaField}>
        <span>Descripción</span>
        <textarea
          name="description"
          placeholder="Información interna de la marca"
          value={formState.description}
          disabled={isCreatingBrand}
          onChange={updateField}
        />
      </label>

      <label className={styles.colorField}>
        <span>Color</span>
        <input
          type="color"
          name="color"
          value={formState.color}
          disabled={isCreatingBrand}
          onChange={updateField}
        />
      </label>

      <button type="button" className={styles.uploadBox} disabled={isCreatingBrand}>
        <Upload size={22} strokeWidth={1.8} />
        <span>Selecciona o arrastra aquí el logo</span>
        <strong>Archivos permitidos: .png, .jpg, .jpeg, .svg</strong>
      </button>

      <section className={styles.suggestions} aria-label="Sugerencias">
        <span>Sugerencias</span>
        <div>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.name}
              type="button"
              disabled={isCreatingBrand}
              onClick={() => selectSuggestion(suggestion.name, suggestion.color)}
            >
              <i style={{ backgroundColor: suggestion.color }} />
              {suggestion.name}
            </button>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <Button variant="outline" theme="optional" size="medium" disabled={isCreatingBrand} onClick={onCancel}>
          Descartar
        </Button>
        <Button type="submit" size="medium" loading={isCreatingBrand}>
          Guardar
        </Button>
      </footer>
    </form>
  );
};
