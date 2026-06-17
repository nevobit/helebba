import type { Warehouse } from '@hlb/contracts';
import type { WarehouseRow } from '../types';

export const toWarehouseRow = (warehouse: Warehouse): WarehouseRow => ({
  id: String(warehouse.id ?? warehouse.name),
  name: warehouse.name || 'Sin nombre',
  email: warehouse.email ?? '',
  phone: warehouse.phone ?? '',
  mobile: warehouse.mobile ?? '',
  city: warehouse.address?.city ?? '',
  country: warehouse.address?.country ?? '',
  color: warehouse.color ?? '#c90edb',
  icon: warehouse.icon ?? 'warehouse',
  isDefault: Boolean(warehouse.isDefault),
});
