import type { InventoryBrand } from '@hlb/contracts';
import type { BrandRow } from '../types';

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

  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || 'BR';
};

export const toBrandRow = (brand: InventoryBrand): BrandRow => ({
  id: String(brand.id ?? brand.slug ?? brand.name),
  initials: getInitials(brand.name || 'Marca'),
  createdAt: formatDate(brand.createdAt),
  name: brand.name || 'Sin nombre',
  description: brand.description ?? '',
  website: brand.website ?? '-',
  position: Number(brand.position ?? 0),
  color: brand.color ?? '#24485a',
});
