import type { PaymentMethodId, PersistedSoftDeletableEntity, UserId } from '../../../../common';

export type PaymentMethodType =
  | 'cash'
  | 'bank_transfer'
  | 'card'
  | 'credit_provider'
  | 'cash_on_delivery'
  | 'other';

export type PaymentSettlementMode = 'instant' | 'deferred' | 'installments' | 'on_delivery';

export type PaymentDisbursementRule = 'immediate' | 'days_after_issue' | 'day_of_month' | 'manual';
export type FinancialFeeType = 'none' | 'fixed' | 'percentage' | 'custom';

export interface PaymentMethod extends PersistedSoftDeletableEntity<PaymentMethodId, UserId> {
  name: string;
  type: PaymentMethodType;
  status: string;
  isDefault: boolean;
  bankingAccountId: string;
  dueDays: number;
  connectionId: string;

  settlementMode: PaymentSettlementMode;
  disbursementRule?: PaymentDisbursementRule;
  disbursementDays?: number;
  disbursementDayOfMonth?: number;

  supportsInstallments?: boolean;
  minInstallments?: number;
  maxInstallments?: number;

  requiresApprovalReference?: boolean;

  requiresDeliveryConfirmation?: boolean;

  financialFeeType?: FinancialFeeType;
  financialFeeValue?: number;

  metadata?: Record<string, unknown>;
}
