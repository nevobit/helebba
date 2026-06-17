import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Button, TextInput } from '@hlb/design-system';
import { Upload } from 'lucide-react';
import { useCreateCategory } from '../../hooks';
import type { CreateCategoryPayload } from '../../services';
import styles from './ProductForm.module.css';

export const CATEGORY_FORM_ID = 'category-form';

type CategoryFormProps = {
  onDirtyChange?: (dirty: boolean) => void;
  onCancel: () => void;
  onSuccess?: () => void;
};

type CategoryFormState = {
  name: string;
  type: 'text' | 'options';
  optionDraft: string;
  options: string[];
  showInCatalog: boolean;
  color: string;
};

const initialState: CategoryFormState = {
  name: '',
  type: 'options',
  optionDraft: '',
  options: [],
  showInCatalog: false,
  color: '#ef4444',
};

const suggestions = [
  { name: 'Ropa', color: '#ef4444' },
  { name: 'Zapatos', color: '#f59e0b' },
  { name: 'Bebidas', color: '#10b981' },
  { name: 'Hardware', color: '#3b82f6' },
];

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const CategoryForm = ({ onCancel, onDirtyChange, onSuccess }: CategoryFormProps) => {
  const [formState, setFormState] = useState<CategoryFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const { createCategory, isCreatingCategory } = useCreateCategory();

  const markDirty = () => onDirtyChange?.(true);

  const updateName = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((current) => ({ ...current, name: event.target.value }));
    setError(null);
    markDirty();
  };

  const updateOptionDraft = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((current) => ({ ...current, optionDraft: event.target.value }));
    markDirty();
  };

  const updateType = (type: CategoryFormState['type']) => {
    setFormState((current) => ({
      ...current,
      type,
      options: type === 'text' ? [] : current.options,
      optionDraft: type === 'text' ? '' : current.optionDraft,
    }));
    markDirty();
  };

  const addOption = (value: string) => {
    const option = value.trim();
    if (!option) return;

    setFormState((current) => ({
      ...current,
      optionDraft: '',
      options: current.options.includes(option) ? current.options : [...current.options, option],
    }));
    markDirty();
  };

  const removeOption = (option: string) => {
    setFormState((current) => ({
      ...current,
      options: current.options.filter((item) => item !== option),
    }));
    markDirty();
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addOption(formState.optionDraft);
  };

  const selectSuggestion = (name: string, color: string) => {
    setFormState((current) => ({
      ...current,
      name: current.name || name,
      color,
      options: current.type === 'options' && !current.options.includes(name) ? [...current.options, name] : current.options,
    }));
    setError(null);
    markDirty();
  };

  const buildPayload = (): CreateCategoryPayload => ({
    name: formState.name.trim(),
    slug: slugify(formState.name),
    type: formState.type,
    color: formState.color,
    description: '',
    icon: '',
    options: formState.type === 'options' ? formState.options : [],
    position: 0,
    showInCatalog: formState.showInCatalog,
    parentId: null,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.name.trim()) {
      setError('Ingresa el nombre de la categoría.');
      return;
    }

    createCategory(buildPayload(), {
      onSuccess: () => {
        onDirtyChange?.(false);
        onSuccess?.();
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'No pudimos crear la categoría.');
      },
    });
  };

  return (
    <form id={CATEGORY_FORM_ID} className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <TextInput
          label="Nombre"
          name="name"
          value={formState.name}
          error={error ?? undefined}
          disabled={isCreatingCategory}
          autoFocus
          onChange={updateName}
        />
      </div>

      <fieldset className={styles.radioGroup}>
        <legend>Tipo de categoría</legend>
        <label>
          <input
            type="radio"
            name="type"
            checked={formState.type === 'text'}
            disabled={isCreatingCategory}
            onChange={() => updateType('text')}
          />
          Texto/Número
        </label>
        <label>
          <input
            type="radio"
            name="type"
            checked={formState.type === 'options'}
            disabled={isCreatingCategory}
            onChange={() => updateType('options')}
          />
          Opciones
        </label>
      </fieldset>

      {formState.type === 'options' && (
        <div className={styles.optionsBlock}>
          <TextInput
            label="Opciones"
            placeholder="Opciones"
            value={formState.optionDraft}
            disabled={isCreatingCategory}
            onChange={updateOptionDraft}
            onKeyDown={handleOptionKeyDown}
          />
          <p>Presiona enter para guardar las opciones</p>
          {formState.options.length > 0 && (
            <div className={styles.chipList} aria-label="Opciones agregadas">
              {formState.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={isCreatingCategory}
                  onClick={() => removeOption(option)}
                >
                  {option}
                  <span aria-hidden="true">×</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <label className={styles.checkboxField}>
        <input
          type="checkbox"
          checked={formState.showInCatalog}
          disabled={isCreatingCategory}
          onChange={(event) => {
            setFormState((current) => ({ ...current, showInCatalog: event.target.checked }));
            markDirty();
          }}
        />
        Mostrar en el catálogo
      </label>

      <button type="button" className={styles.uploadBox} disabled={isCreatingCategory}>
        <Upload size={22} strokeWidth={1.8} />
        <span>Selecciona o arrastra aquí tus archivos</span>
        <strong>Archivos permitidos: .png, .jpg, .jpeg, .svg</strong>
      </button>

      <section className={styles.suggestions} aria-label="Sugerencias">
        <span>Sugerencias</span>
        <div>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.name}
              type="button"
              disabled={isCreatingCategory}
              onClick={() => selectSuggestion(suggestion.name, suggestion.color)}
            >
              <i style={{ backgroundColor: suggestion.color }} />
              {suggestion.name}
            </button>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <Button variant="outline" theme="optional" size="medium" disabled={isCreatingCategory} onClick={onCancel}>
          Descartar
        </Button>
        <Button type="submit" size="medium" loading={isCreatingCategory}>
          Guardar
        </Button>
      </footer>
    </form>
  );
};
