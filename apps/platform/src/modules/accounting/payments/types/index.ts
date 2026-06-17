import type { Payment } from '@hlb/contracts';

export type PaymentListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: string;
};

export type PaymentRow = {
  id: string;
  date: string;
  createdAt: string;
  contactName: string;
  account: string;
  description: string;
  total: number;
  direction: Payment['direction'];
  feeAmount: number;
  netAmount: number;
  status: string;
  statusTone: 'warning' | 'success' | 'neutral';
  reconciliationStatus: string;
  reconciliationTone: 'warning' | 'success' | 'neutral';
  source: Payment;
};

export type CreatePaymentPayload = Partial<
  Pick<
    Payment,
    | 'amount'
    | 'bankAccountId'
    | 'paymentMethodId'
    | 'direction'
    | 'contactId'
    | 'contactName'
    | 'date'
    | 'description'
    | 'documentId'
    | 'documentType'
    | 'feeName'
    | 'feeType'
    | 'feeValue'
    | 'financialFeePaymentMethodId'
    | 'supportFile'
  >
>;
