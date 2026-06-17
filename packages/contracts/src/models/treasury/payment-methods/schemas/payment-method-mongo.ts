import { Schema } from 'mongoose';
import type { PaymentMethod } from './payment-method';
import { baseFields, opts } from '../../../../common';

export const PaymentMethodSchemaMongo = new Schema<PaymentMethod>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true },
    type: { type: String, default: 'bank_transfer' },
    status: { type: String, default: 'active' },
    isDefault: { type: Boolean, default: false },
    bankingAccountId: { type: String },
    dueDays: { type: Number, default: 0 },
    connectionId: { type: String },
    settlementMode: { type: String, default: 'deferred' },
    disbursementRule: { type: String, default: 'days_after_issue' },
    disbursementDays: { type: Number },
    disbursementDayOfMonth: { type: Number },
    supportsInstallments: { type: Boolean },
    minInstallments: { type: Number },
    maxInstallments: { type: Number },
    requiresApprovalReference: { type: Boolean },
    requiresDeliveryConfirmation: { type: Boolean },
    financialFeeType: { type: String },
    financialFeeValue: { type: Number },
    metadata: { type: Schema.Types.Mixed },
  },

  { ...opts },
);
