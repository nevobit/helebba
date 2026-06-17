import type { Document } from '@hlb/contracts';
import type { DocumentRow } from '../types';

const DocumentStatus = {
  Pending: 0,
  Paid: 1,
  PartiallyPaid: 2,
  Cancelled: 3,
} as const;

const formatDate = (value?: string) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const statusLabel = (status: Document['status']) => {
  if (status === DocumentStatus.Paid) return { label: 'Pagada', tone: 'success' as const };
  if (status === DocumentStatus.PartiallyPaid) return { label: 'Parcial', tone: 'neutral' as const };
  if (status === DocumentStatus.Cancelled) return { label: 'Anulada', tone: 'danger' as const };

  return { label: 'Pendiente', tone: 'warning' as const };
};

export const toDocumentRow = (
  document: Document,
  paymentMethodNamesById: Map<string, string> = new Map(),
): DocumentRow => {
  const status = statusLabel(document.status);
  const id = 'id' in document ? document.id : undefined;
  const paymentMethodId = document.paymentMethodId ? String(document.paymentMethodId) : '';
  const paymentMethodName = paymentMethodId ? paymentMethodNamesById.get(paymentMethodId) : undefined;

  return {
    id: String(id ?? document.docNumber),
    date: formatDate(document.date),
    docNumber: document.docNumber || '-',
    operationDate: formatDate(document.date),
    dueDate: formatDate(document.dueDate),
    contactName: document.contactName || '-',
    description: document.description || document.lines?.[0]?.concept || '-',
    tags: document.tags?.join(', ') ?? '',
    account: 'No asignado',
    paymentMethod: paymentMethodName || paymentMethodId || 'Transferencia bancaria',
    project: '-',
    subtotal: Number(document.subtotal ?? 0),
    tax: Number(document.tax ?? 0),
    total: Number(document.total ?? 0),
    status: status.label,
    statusTone: status.tone,
    source: document,
  };
};
