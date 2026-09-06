import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type {
  ExpenseAccountId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../common';

export type ExpenseAccountType =
  | 'expense'
  | 'income'
  | 'asset'
  | 'liability'
  | 'equity'
  | 'cost_of_sales'
  | 'other';

export interface ExpenseAccount extends PersistedSoftDeletableEntity<ExpenseAccountId, UserId> {
  code: string;
  name: string;
  description: string;
  type: ExpenseAccountType;
  parentId?: ExpenseAccountId;
  active: boolean;
  isDefault: boolean;
  metadata?: Record<string, unknown>;
}

export const ExpenseAccountSchemaMongo = new Schema<ExpenseAccount>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, default: 'expense' },
    parentId: { type: String },
    active: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { ...opts },
);

ExpenseAccountSchemaMongo.index(
  { organizationId: 1, code: 1 },
  { unique: true, partialFilterExpression: { lifecycleStatus: { $ne: 'deleted' } } },
);
