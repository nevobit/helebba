import type {
  BankingAccountId,
  ISODateTimeString,
  PersistedSoftDeletableEntity,
  TreasuryMovementId,
  UserId,
} from '../../../../common';

export type TreasuryAccountKind = 'bank' | 'cash';
export type TreasuryAccountProductType =
  | 'checking'
  | 'savings'
  | 'credit'
  | 'loan'
  | 'wallet'
  | 'card'
  | 'payment_gateway'
  | 'cash';
export type TreasuryAccountConnectionStatus = 'connected' | 'not_connected' | 'pending' | 'error';
export type TreasuryMovementDirection = 'inflow' | 'outflow';
export type TreasuryMovementReconciliationStatus = 'pending' | 'reconciled';

export interface BankingAccount extends PersistedSoftDeletableEntity<BankingAccountId, UserId> {
  kind: TreasuryAccountKind;
  productType: TreasuryAccountProductType;
  name: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  iban?: string;
  swift?: string;
  currency: string;
  balance: number;
  initialBalance: number;
  accountingAccountCode?: string;
  connectionStatus: TreasuryAccountConnectionStatus;
  archivedAt?: Date | null;
  archivedBy?: UserId;
  metadata?: Record<string, unknown>;
}

export interface TreasuryMovement
  extends PersistedSoftDeletableEntity<TreasuryMovementId, UserId> {
  bankingAccountId: BankingAccountId | string;
  accountKind: TreasuryAccountKind;
  date: ISODateTimeString;
  description: string;
  amount: number;
  direction: TreasuryMovementDirection;
  currency: string;
  balance?: number;
  reference?: string;
  reconciliationStatus: TreasuryMovementReconciliationStatus;
  reconciledAt?: Date | null;
  reconciledBy?: UserId;
  paymentId?: string;
  documentId?: string;
  metadata?: Record<string, unknown>;
}
