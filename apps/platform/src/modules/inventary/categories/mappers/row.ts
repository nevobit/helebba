import type { Category } from '@hlb/contracts';
import type { CategoryRow } from '../types';

export type HierarchicalCategory = {
  category: Category;
  depth: number;
  path: string;
};

export const flattenCategories = (categories: readonly Category[]): HierarchicalCategory[] => {
  const byParent = new Map<string | null, Category[]>();
  const ids = new Set(categories.map((category) => String(category.id)));
  const sorted = [...categories].sort(
    (left, right) => (left.position ?? 0) - (right.position ?? 0) || left.name.localeCompare(right.name),
  );

  sorted.forEach((category) => {
    const parentId = category.parentId && ids.has(String(category.parentId)) ? String(category.parentId) : null;
    byParent.set(parentId, [...(byParent.get(parentId) ?? []), category]);
  });

  const result: HierarchicalCategory[] = [];
  const visited = new Set<string>();
  const visit = (category: Category, depth: number, parentPath: string) => {
    const id = String(category.id);
    if (visited.has(id)) return;
    visited.add(id);
    const path = parentPath ? `${parentPath} / ${category.name}` : category.name;
    result.push({ category, depth, path });
    (byParent.get(id) ?? []).forEach((child) => visit(child, depth + 1, path));
  };

  (byParent.get(null) ?? []).forEach((category) => visit(category, 0, ''));
  sorted.filter((category) => !visited.has(String(category.id))).forEach((category) => visit(category, 0, ''));
  return result;
};

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

export const toCategoryRow = (category: Category, depth = 0, parentName?: string): CategoryRow => ({
  id: String(category.id ?? category.slug ?? category.name),
  initials: getInitials(category.name || 'Categoría'),
  createdAt: formatDate(category.createdAt),
  name: category.name || 'Sin nombre',
  type: getTypeLabel(category.type),
  options: category.options?.length ? category.options.join(', ') : '-',
  showInCatalog: category.showInCatalog ? 'Sí' : 'No',
  position: Number(category.position ?? 0),
  color: category.color ?? '#6b7280',
  depth,
  parentName: parentName ?? '-',
});
