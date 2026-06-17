import type {
  ISODateTimeString,
  PaymentId,
  PaymentMethodId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../../common';
import type { DocumentType } from '../../../sales';
import type { FinancialFeeType } from '../../../treasury';

export type PaymentStatus = 'unassigned' | 'assigned' | 'partial';
export type PaymentReconciliationStatus = 'pending' | 'reconciled' | 'partial';
export type PaymentDirection = 'inflow' | 'outflow';

export type PaymentSupportFile = {
  name: string;
  type: string;
  size: number;
  url?: string;
};

export interface Payment extends PersistedSoftDeletableEntity<PaymentId, UserId> {
  bankAccountId: string;
  paymentMethodId?: PaymentMethodId | string;
  contactId: string;
  contactName: string;
  amount: number;
  direction?: PaymentDirection;
  grossAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  financialFeePaymentMethodId?: PaymentMethodId | string;
  feeName?: string;
  feeType?: FinancialFeeType;
  feeValue?: number;
  description: string;
  date: ISODateTimeString;
  status: PaymentStatus;
  reconciliationStatus: PaymentReconciliationStatus;
  totalDocuments: number;
  totalTransactions: number;
  totalAdvance: number;
  documentType?: DocumentType;
  documentId?: string;
  supportFile?: PaymentSupportFile;
}
