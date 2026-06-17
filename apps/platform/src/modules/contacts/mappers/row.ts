import type { Contact } from '@hlb/contracts';
import type { ContactRow } from '../types';

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

  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || 'C';
};

export const toContactRow = (contact: Contact): ContactRow => ({
  id: String(contact.id ?? contact.customId ?? contact.code),
  code: contact.code ?? contact.vatnumber ?? '',
  initials: getInitials(contact.name || contact.tradeName || contact.email || 'Contacto'),
  createdAt: formatDate(contact.createdAt),
  name: contact.name || contact.tradeName || 'Sin nombre',
  tradeName: contact.tradeName ?? '',
  email: contact.email ?? '',
  phone: contact.phone ?? '',
  mobile: contact.mobile ?? '',
  address: contact.address ?? '',
  city: contact.city ?? '',
  postalCode: contact.postalCode ?? '',
  department: contact.department ?? '',
  country: contact.country ?? '',
  countryCode: contact.country === 'Colombia' ? 'CO' : '',
  language: contact.country === 'Colombia' ? 'Español (Colombia)' : '',
  website: contact.website ?? '',
  tags: contact.tags?.join(', ') ?? '',
  kind: contact.type || (contact.isPerson ? 'Persona' : 'Empresa'),
  isPerson: Boolean(contact.isPerson),
  companyId: contact.companyId ? String(contact.companyId) : '',
  portalVisibility: 'Por defecto',
});
