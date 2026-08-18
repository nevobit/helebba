import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import type { PosStore } from './pos';

export const PosStoreSchemaMongo = new Schema<PosStore>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String },
    updatedBy: { type: String },
    deletedBy: { type: String },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    warehouseId: { type: String, required: true },
    warehouseName: { type: String, required: true },
    active: { type: Boolean, default: true },
    registers: [
      {
        _id: false,
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        isMain: { type: Boolean },
        status: { type: String, enum: ['open', 'closed'], default: 'closed' },
        paymentMethodIds: [{ type: String }],
      },
    ],
    sessions: [
      {
        _id: false,
        id: { type: String, required: true },
        registerId: { type: String, required: true },
        registerName: { type: String },
        openedAt: { type: Date },
        closedAt: { type: Date },
        status: { type: String, enum: ['open', 'closed'] },
        openingBalance: { type: Number, min: 0 },
        closingBalance: { type: Number, min: 0 },
        expectedBalance: { type: Number, min: 0 },
        discrepancy: { type: Number },
        salesTotal: { type: Number, min: 0, default: 0 },
        receiptCount: { type: Number, min: 0, default: 0 },
        openedBy: { type: String },
        closedBy: { type: String },
      },
    ],
  },
  { ...opts },
);
