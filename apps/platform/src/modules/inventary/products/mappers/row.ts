import type { Product } from '@hlb/contracts';
import type { ProductRow } from '../types';

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

  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || 'PR';
};

const getMoney = (value: number | undefined) => Number(value ?? 0);

export const toProductRow = (product: Product): ProductRow => ({
  id: String(product.id ?? product.sku ?? product.slug ?? product.name),
  initials: getInitials(product.name || 'Producto'),
  createdAt: formatDate(product.createdAt),
  name: product.name || 'Sin nombre',
  description: product.description ?? '',
  sku: product.sku ?? '',
  supply: product.forPurchase ? 'Comprado' : '',
  warehouse: product.warehouseId ? String(product.warehouseId) : '',
  channel: product.salesChannelId ? String(product.salesChannelId) : 'No asignado',
  stock: Number(product.stock ?? 0),
  purchasePrice: getMoney(product.purchasePrice),
  cost: getMoney(product.cost),
  salesValue: getMoney(product.price),
  subtotal: getMoney(product.price),
  salesTax: 0,
  payroll: 0,
  taxes: product.taxes?.join(', ') ?? '',
  total: getMoney(product.total || product.price),
  actions: '',
});
