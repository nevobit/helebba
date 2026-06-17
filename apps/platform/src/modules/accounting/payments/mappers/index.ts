import type { Payment } from '@hlb/contracts';
import type { PaymentRow } from '../types';

const formatDate = (value?: string | Date) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatDateTime = (value?: string | Date) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const statusLabel = (status?: Payment['status']) => {
  if (status === 'assigned') return { label: 'Asignado', tone: 'success' as const };
  if (status === 'partial') return { label: 'Parcial', tone: 'neutral' as const };

  return { label: 'Pendiente', tone: 'warning' as const };
};

const reconciliationLabel = (status?: Payment['reconciliationStatus']) => {
  if (status === 'reconciled') return { label: 'Conciliado', tone: 'success' as const };
  if (status === 'partial') return { label: 'Parcial', tone: 'neutral' as const };

  return { label: 'Pendiente', tone: 'warning' as const };
};

export const toPaymentRow = (payment: Payment): PaymentRow => {
  const status = statusLabel(payment.status);
  const reconciliationStatus = reconciliationLabel(payment.reconciliationStatus);
  const id = 'id' in payment ? payment.id : undefined;
  const direction =
    payment.direction ?? (payment.documentType === 'purchase' || payment.documentType === 'expenses' ? 'outflow' : 'inflow');

  return {
    id: String(id),
    date: formatDate(payment.date),
    createdAt: formatDateTime(payment.createdAt),
    contactName: payment.contactName || '-',
    account: payment.bankAccountId || 'No asignado',
    description: payment.description || 'Pago',
    total: Number(payment.grossAmount ?? payment.amount ?? 0),
    direction,
    feeAmount: Number(payment.feeAmount ?? 0),
    netAmount: Number(payment.netAmount ?? payment.grossAmount ?? payment.amount ?? 0),
    status: status.label,
    statusTone: status.tone,
    reconciliationStatus: reconciliationStatus.label,
    reconciliationTone: reconciliationStatus.tone,
    source: payment,
  };
};
