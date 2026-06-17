import type { Service } from '@hlb/contracts';
import type { ServiceRow } from '../types';

const getInitials = (value: string) => {
  const parts = value.trim().split(/\s+/);

  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || 'SE';
};

export const toServiceRow = (service: Service): ServiceRow => ({
  id: String(service.id ?? service.code ?? service.name),
  initials: getInitials(service.name || 'Servicio'),
  name: service.name || 'Sin nombre',
  description: service.description ?? '',
  tags: service.tags?.join(', ') ?? '',
  code: service.code ?? '',
  account: service.salesChannelId ? service.salesChannelId : 'No asignado',
  subtotal: Number(service.price ?? 0),
  cost: Number(service.cost ?? 0),
  tax: Number(service.tax ?? 0),
  employees: 0,
  recurring: 0,
  total: Number(service.total ?? service.price ?? 0),
  color: service.color ?? '#4ade80',
});
