import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type { PersistedSoftDeletableEntity, TaxId, UserId } from '../../../common';

export interface Tax extends PersistedSoftDeletableEntity<TaxId, UserId> {
  code: string;
  name: string;
  description: string;
  rate: number;
  kind: 'sales' | 'purchase' | 'withholding' | 'both';
  inclusive: boolean;
  recoverable: boolean;
  active: boolean;
  isDefault: boolean;
  countryCode?: string;
  accountId?: string;
  metadata?: Record<string, unknown>;
}

export const TaxSchemaMongo = new Schema<Tax>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    rate: { type: Number, required: true, min: 0 },
    kind: { type: String, enum: ['sales', 'purchase', 'withholding', 'both'], default: 'both' },
    inclusive: { type: Boolean, default: false },
    recoverable: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    countryCode: { type: String, uppercase: true, trim: true },
    accountId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { ...opts },
);

TaxSchemaMongo.index(
  { organizationId: 1, code: 1 },
  { unique: true, partialFilterExpression: { lifecycleStatus: { $ne: 'deleted' } } },
);
