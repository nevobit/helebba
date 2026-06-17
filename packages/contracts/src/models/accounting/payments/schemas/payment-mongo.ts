import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../../common';
import type { Payment } from './payment';

export const PaymentSchemaMongo = new Schema<Payment>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    bankAccountId: { type: String },
    paymentMethodId: { type: String },
    contactId: { type: String },
    contactName: { type: String },
    amount: { type: Number, required: true },
    direction: { type: String, default: 'inflow' },
    grossAmount: { type: Number },
    feeAmount: { type: Number },
    netAmount: { type: Number },
    financialFeePaymentMethodId: { type: String },
    feeName: { type: String },
    feeType: { type: String },
    feeValue: { type: Number },
    description: { type: String },
    date: { type: String, required: true },
    status: { type: String, default: 'unassigned' },
    reconciliationStatus: { type: String, default: 'pending' },
    totalDocuments: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },
    totalAdvance: { type: Number, default: 0 },
    documentType: { type: String },
    documentId: { type: String },
    supportFile: {
      name: { type: String },
      type: { type: String },
      size: { type: Number },
      url: { type: String },
    },
  },
  { ...opts },
);
