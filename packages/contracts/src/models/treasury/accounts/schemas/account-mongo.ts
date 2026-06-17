import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { BankingAccount, TreasuryMovement } from './account';

export const BankingAccountSchemaMongo = new Schema<BankingAccount>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    kind: { type: String, required: true, default: 'bank', index: true },
    productType: { type: String, required: true, default: 'checking' },
    name: { type: String, required: true },
    bankName: { type: String },
    bankCode: { type: String },
    accountNumber: { type: String },
    iban: { type: String },
    swift: { type: String },
    currency: { type: String, required: true, default: 'COP' },
    balance: { type: Number, default: 0 },
    initialBalance: { type: Number, default: 0 },
    accountingAccountCode: { type: String },
    connectionStatus: { type: String, default: 'not_connected' },
    archivedAt: { type: Date },
    archivedBy: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { ...opts },
);

export const TreasuryMovementSchemaMongo = new Schema<TreasuryMovement>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    bankingAccountId: { type: String, required: true, index: true },
    accountKind: { type: String, required: true, default: 'bank', index: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    direction: { type: String, required: true, default: 'inflow' },
    currency: { type: String, required: true, default: 'COP' },
    balance: { type: Number },
    reference: { type: String },
    reconciliationStatus: { type: String, required: true, default: 'pending', index: true },
    reconciledAt: { type: Date },
    reconciledBy: { type: String },
    paymentId: { type: String },
    documentId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { ...opts },
);
