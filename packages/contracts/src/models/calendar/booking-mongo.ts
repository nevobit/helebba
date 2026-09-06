import { Schema } from 'mongoose';
import { baseFields, opts } from '../../common';
import type { Booking } from './booking';

export const BookingSchemaMongo = new Schema<Booking>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    locationId: { type: String, required: true, index: true },
    serviceId: { type: String, required: true, index: true },
    dateTime: { type: Date, required: true, index: true },
    timezone: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    customFields: [{ _id: false, key: { type: String, required: true }, value: Schema.Types.Mixed }],
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    cancelledAt: { type: Date },
  },
  { ...opts },
);

BookingSchemaMongo.index({ organizationId: 1, dateTime: 1, status: 1 });
