import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type {
  ExpenseAccountId,
  JournalEntryId,
  PersistedSoftDeletableEntity,
  UserId,
} from '../../../common';

export interface JournalEntryLine {
  accountId: ExpenseAccountId;
  description: string;
  debit: number;
  credit: number;
  contactId?: string;
  documentId?: string;
  taxId?: string;
  metadata?: Record<string, unknown>;
}

export interface JournalEntry extends PersistedSoftDeletableEntity<JournalEntryId, UserId> {
  number: string;
  date: Date;
  description: string;
  reference: string;
  status: 'draft' | 'posted' | 'void';
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  postedAt?: Date;
  postedBy?: UserId;
  voidedAt?: Date;
  voidedBy?: UserId;
  metadata?: Record<string, unknown>;
}

const lineSchema = new Schema<JournalEntryLine>(
  {
    accountId: { type: String, required: true },
    description: { type: String, default: '' },
    debit: { type: Number, min: 0, default: 0 },
    credit: { type: Number, min: 0, default: 0 },
    contactId: { type: String },
    documentId: { type: String },
    taxId: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

export const JournalEntrySchemaMongo = new Schema<JournalEntry>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    number: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, default: '' },
    reference: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'posted', 'void'], default: 'draft', index: true },
    lines: { type: [lineSchema], default: [] },
    totalDebit: { type: Number, min: 0, default: 0 },
    totalCredit: { type: Number, min: 0, default: 0 },
    postedAt: { type: Date },
    postedBy: { type: String },
    voidedAt: { type: Date },
    voidedBy: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { ...opts },
);

JournalEntrySchemaMongo.index(
  { organizationId: 1, number: 1 },
  { unique: true, partialFilterExpression: { lifecycleStatus: { $ne: 'deleted' } } },
);
JournalEntrySchemaMongo.index({ organizationId: 1, date: -1 });
