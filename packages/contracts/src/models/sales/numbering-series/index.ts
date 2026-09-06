import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type {
  NumberingSeriesId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../common';
import type { DocumentType } from '../documents';

export type NumberingResetPeriod = 'never' | 'yearly' | 'monthly';

export interface NumberingSeries
  extends PersistedSoftDeletableEntity<NumberingSeriesId, UserId> {
  name: string;
  prefix: string;
  suffix: string;
  separator: string;
  padding: number;
  nextNumber: number;
  documentTypes: DocumentType[];
  resetPeriod: NumberingResetPeriod;
  lastResetKey?: string;
  active: boolean;
  isDefault: boolean;
}

export const NumberingSeriesSchemaMongo = new Schema<NumberingSeries>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true, trim: true },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    separator: { type: String, default: '-' },
    padding: { type: Number, default: 4, min: 1, max: 12 },
    nextNumber: { type: Number, default: 1, min: 1 },
    documentTypes: { type: [String], default: [] },
    resetPeriod: { type: String, enum: ['never', 'yearly', 'monthly'], default: 'never' },
    lastResetKey: { type: String },
    active: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
  },
  { ...opts },
);

NumberingSeriesSchemaMongo.index(
  { organizationId: 1, name: 1 },
  { unique: true, partialFilterExpression: { lifecycleStatus: { $ne: 'deleted' } } },
);
