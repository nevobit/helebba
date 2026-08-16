import { useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Button, TextInput } from '@hlb/design-system';
import { ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import type { CategoryId, ProductFieldDefinition, ProductFieldDefinitionId, ProductFieldType } from '@hlb/contracts';
import { useCategories } from '@/modules/inventary/categories/hooks';
import { useProductFieldDefinitionMutations, useProductFieldDefinitions } from '@/modules/inventary/product-field-definitions';
import styles from './ProductFieldsSettingsPanel.module.css';

type Props = { onClose: () => void };
type FormState = { id?: ProductFieldDefinitionId; label: string; type: ProductFieldType; required: boolean; active: boolean; appliesTo: 'all' | 'categories'; categoryIds: CategoryId[]; options: string; order: string };
const emptyForm: FormState = { label: '', type: 'text', required: false, active: true, appliesTo: 'all', categoryIds: [], options: '', order: '0' };
const TYPE_LABELS: Record<ProductFieldType, string> = { text: 'Texto corto', 'long-text': 'Texto largo', number: 'Número', boolean: 'Sí / No', select: 'Selección', 'multi-select': 'Selección múltiple', date: 'Fecha' };
const toForm = (definition: ProductFieldDefinition): FormState => ({ id: definition.id, label: definition.label, type: definition.type, required: definition.required, active: definition.active, appliesTo: definition.appliesTo, categoryIds: definition.categoryIds, options: definition.options.map(({ label }) => label).join(', '), order: String(definition.order) });
const optionValue = (label: string) => label.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

export const ProductFieldsSettingsPanel = ({ onClose }: Props) => {
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [error, setError] = useState('');
  const { definitions, isLoadingDefinitions } = useProductFieldDefinitions({ includeInactive: true });
  const { categories } = useCategories({ page: 1, limit: 100, search: '' });
  const { createDefinitionAsync, updateDefinitionAsync, removeDefinitionAsync, isSavingDefinition } = useProductFieldDefinitionMutations();
  const reset = () => { setFormState(emptyForm); setError(''); };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!formState.label.trim()) { setError('Escribe el nombre del campo.'); return; }
    const optionLabels = formState.options.split(',').map((item) => item.trim()).filter(Boolean);
    const payload = { label: formState.label.trim(), type: formState.type, target: 'product' as const, required: formState.required, active: formState.active, appliesTo: formState.appliesTo, categoryIds: formState.appliesTo === 'categories' ? formState.categoryIds : [], options: optionLabels.map((label) => ({ label, value: optionValue(label) })), order: Number(formState.order) || 0 };
    try { if (formState.id) await updateDefinitionAsync({ id: formState.id, payload }); else await createDefinitionAsync(payload); reset(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No pudimos guardar el campo.'); }
  };

  const panel = <div className={styles.overlay} data-modal-layer="true" role="presentation"><aside className={styles.panel} aria-label="Campos personalizados de productos">
    <header className={styles.header}><h2>Campos personalizados</h2><button className={styles.closeButton} type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button></header>
    <nav className={styles.breadcrumb}><span>Configuración</span><ChevronRight size={16} /><strong>Campos de productos</strong></nav>
    <div className={styles.content}>
      <section className={styles.listCard}>
        <div className={styles.sectionHeader}><div><h3>Campos disponibles</h3><p>Se reutilizan automáticamente en los productos aplicables.</p></div><Button type="button" size="slim" onClick={reset}>Nuevo campo</Button></div>
        {isLoadingDefinitions ? <p>Cargando...</p> : <div className={styles.definitionList}>{definitions.map((definition) => <article className={styles.definitionRow} key={String(definition.id)}>
          <div><strong>{definition.label}</strong><span>{TYPE_LABELS[definition.type]} · {definition.appliesTo === 'all' ? 'Todos los productos' : `${definition.categoryIds.length} categorías`}</span></div>
          <span className={definition.active ? styles.activeBadge : styles.inactiveBadge}>{definition.active ? 'Activo' : 'Inactivo'}</span>
          <button type="button" aria-label={`Editar ${definition.label}`} onClick={() => setFormState(toForm(definition))}><Pencil size={16} /></button>
          <button type="button" aria-label={`Eliminar ${definition.label}`} disabled={isSavingDefinition} onClick={() => void removeDefinitionAsync(definition.id)}><Trash2 size={16} /></button>
        </article>)}{definitions.length === 0 && <p>Aún no hay campos personalizados.</p>}</div>}
      </section>
      <form className={styles.formCard} onSubmit={save}>
        <h3>{formState.id ? 'Editar campo' : 'Nuevo campo'}</h3>
        <TextInput label="Nombre del campo *" value={formState.label} error={error || undefined} onChange={(event) => setFormState((current) => ({ ...current, label: event.target.value }))} />
        <label className={styles.field}><span>Tipo</span><select value={formState.type} onChange={(event) => setFormState((current) => ({ ...current, type: event.target.value as ProductFieldType }))}>{Object.entries(TYPE_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        {(formState.type === 'select' || formState.type === 'multi-select') && <label className={styles.field}><span>Opciones separadas por coma</span><textarea value={formState.options} placeholder="Algodón, Lino, Poliéster" onChange={(event) => setFormState((current) => ({ ...current, options: event.target.value }))} /></label>}
        <label className={styles.field}><span>Mostrar en</span><select value={formState.appliesTo} onChange={(event) => setFormState((current) => ({ ...current, appliesTo: event.target.value as 'all' | 'categories' }))}><option value="all">Todos los productos</option><option value="categories">Categorías específicas</option></select></label>
        {formState.appliesTo === 'categories' && <fieldset className={styles.categories}><legend>Categorías</legend>{categories.map((category) => { const id = category.id as CategoryId; return <label key={String(id)}><input type="checkbox" checked={formState.categoryIds.includes(id)} onChange={(event) => setFormState((current) => ({ ...current, categoryIds: event.target.checked ? [...current.categoryIds, id] : current.categoryIds.filter((item) => item !== id) }))} />{category.name}</label>; })}</fieldset>}
        <div className={styles.twoColumns}><TextInput label="Orden" type="number" value={formState.order} onChange={(event) => setFormState((current) => ({ ...current, order: event.target.value }))} /><label className={styles.check}><input type="checkbox" checked={formState.required} onChange={(event) => setFormState((current) => ({ ...current, required: event.target.checked }))} />Obligatorio</label></div>
        <label className={styles.check}><input type="checkbox" checked={formState.active} onChange={(event) => setFormState((current) => ({ ...current, active: event.target.checked }))} />Campo activo</label>
        <div className={styles.actions}><Button type="button" theme="optional" variant="outline" onClick={reset}>Limpiar</Button><Button type="submit" loading={isSavingDefinition}>Guardar campo</Button></div>
      </form>
    </div>
  </aside></div>;

  return createPortal(panel, document.body);
};
