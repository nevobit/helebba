import { Schema } from 'mongoose';
import { baseFields, opts } from '../../common';
import type {
  BillingForecastId,
  ISODateTimeString,
  PersistedSoftDeletableEntity,
  RemittanceId,
  UserId,
} from '../../common';

export type RemittanceStatus = 'draft' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Remittance extends PersistedSoftDeletableEntity<RemittanceId, UserId> {
  name: string;
  status: RemittanceStatus;
  type: 'collection' | 'payment';
  currency: string;
  total: number;
  dueDate?: ISODateTimeString;
  paymentIds: string[];
  bankingAccountId?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

export interface BillingForecast
  extends PersistedSoftDeletableEntity<BillingForecastId, UserId> {
  name: string;
  direction: 'receivable' | 'payable';
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  currency: string;
  forecastDate: ISODateTimeString;
  contactId?: string;
  documentId?: string;
  paymentMethodId?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

const scopedFields = {
  ...baseFields,
  organizationId: { type: String, required: true, index: true },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedBy: { type: String },
};

export const RemittanceSchemaMongo = new Schema<Remittance>(
  {
    ...scopedFields,
    name: { type: String, required: true },
    status: { type: String, required: true, default: 'draft', index: true },
    type: { type: String, required: true, default: 'collection' },
    currency: { type: String, required: true, default: 'EUR' },
    total: { type: Number, required: true, default: 0 },
    dueDate: { type: String },
    paymentIds: [{ type: String }],
    bankingAccountId: { type: String },
    reference: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { ...opts },
);

export const BillingForecastSchemaMongo = new Schema<BillingForecast>(
  {
    ...scopedFields,
    name: { type: String, required: true },
    direction: { type: String, required: true, default: 'receivable', index: true },
    status: { type: String, required: true, default: 'pending', index: true },
    amount: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: 'EUR' },
    forecastDate: { type: String, required: true, index: true },
    contactId: { type: String, index: true },
    documentId: { type: String, index: true },
    paymentMethodId: { type: String },
    notes: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { ...opts },
);
