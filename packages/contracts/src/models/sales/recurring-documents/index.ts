import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type {
  ISODateTimeString,
  NumberingSeriesId,
  PersistedSoftDeletableEntity,
  RecurringDocumentId,
  UserId,
} from '../../../common';
import type { Document, DocumentType } from '../documents';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringDocument
  extends PersistedSoftDeletableEntity<RecurringDocumentId, UserId> {
  name: string;
  documentType: DocumentType;
  template: Partial<Document>;
  frequency: RecurringFrequency;
  interval: number;
  startAt: ISODateTimeString;
  nextRunAt: ISODateTimeString;
  endAt?: ISODateTimeString;
  lastRunAt?: ISODateTimeString;
  generatedCount: number;
  numberingSeriesId?: NumberingSeriesId;
  active: boolean;
}

export const RecurringDocumentSchemaMongo = new Schema<RecurringDocument>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true, trim: true },
    documentType: { type: String, required: true, index: true },
    template: { type: Schema.Types.Mixed, required: true, default: {} },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
    interval: { type: Number, default: 1, min: 1 },
    startAt: { type: String, required: true },
    nextRunAt: { type: String, required: true, index: true },
    endAt: { type: String },
    lastRunAt: { type: String },
    generatedCount: { type: Number, default: 0 },
    numberingSeriesId: { type: String },
    active: { type: Boolean, default: true, index: true },
  },
  { ...opts },
);

RecurringDocumentSchemaMongo.index({ organizationId: 1, active: 1, nextRunAt: 1 });
