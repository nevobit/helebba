import type { Category } from '@hlb/contracts';
import type { CategoryRow } from '../types';

const formatDate = (value: Date | string | undefined) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const getInitials = (value: string) => {
  const parts = value.trim().split(/\s+/);

  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || 'CA';
};

const getTypeLabel = (type: string | undefined) => {
  if (type === 'options') return 'Opciones';
  if (type === 'text') return 'Texto/Número';

  return type || 'Sin tipo';
};

export const toCategoryRow = (category: Category): CategoryRow => ({
  id: String(category.id ?? category.slug ?? category.name),
  initials: getInitials(category.name || 'Categoría'),
  createdAt: formatDate(category.createdAt),
  name: category.name || 'Sin nombre',
  type: getTypeLabel(category.type),
  options: category.options?.length ? category.options.join(', ') : '-',
  showInCatalog: category.showInCatalog ? 'Sí' : 'No',
  position: Number(category.position ?? 0),
  color: category.color ?? '#6b7280',
});
