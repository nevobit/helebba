import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type {
  PaymentMethodId,
  PersistedSoftDeletableEntity,
  SalesChannelId,
  UserId,
  WarehouseId,
} from '../../../common';

export type SalesChannelType = 'direct' | 'online' | 'marketplace' | 'pos' | 'b2b' | 'other';

export interface SalesChannel extends PersistedSoftDeletableEntity<SalesChannelId, UserId> {
  name: string;
  description: string;
  type: SalesChannelType;
  color: string;
  active: boolean;
  isDefault: boolean;
  warehouseId?: WarehouseId;
  paymentMethodId?: PaymentMethodId;
  metadata?: Record<string, unknown>;
}

export const SalesChannelSchemaMongo = new Schema<SalesChannel>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, default: 'direct' },
    color: { type: String, default: '#4180f3' },
    active: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    warehouseId: { type: String },
    paymentMethodId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { ...opts },
);
