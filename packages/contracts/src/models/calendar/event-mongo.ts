import { Schema } from 'mongoose';
import { baseFields, opts } from '../../common';
import type { CalendarEvent } from './event';

export const CalendarEventSchemaMongo = new Schema<CalendarEvent>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true, index: true },
    allDay: { type: Boolean, default: false },
    timezone: { type: String, default: 'UTC' },
    status: { type: String, enum: ['confirmed', 'tentative', 'cancelled'], default: 'confirmed' },
    visibility: { type: String, enum: ['private', 'organization'], default: 'organization' },
    ownerId: { type: String, required: true, index: true },
    attendeeIds: [{ type: String }],
    attendeeEmails: [{ type: String, lowercase: true, trim: true }],
    reminders: [
      {
        _id: false,
        method: { type: String, enum: ['email', 'notification'], required: true },
        minutesBefore: { type: Number, required: true, min: 0 },
      },
    ],
    color: { type: String },
    contactId: { type: String, index: true },
    contactName: { type: String, trim: true },
    kind: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    leadId: { type: String, index: true },
    funnelId: { type: String, index: true },
    relatedEntityType: {
      type: String,
      enum: ['contact', 'crm_opportunity', 'project', 'project_task'],
    },
    relatedEntityId: { type: String, index: true },
    recurrenceRule: { type: String },
  },
  { ...opts },
);

CalendarEventSchemaMongo.index({ organizationId: 1, startsAt: 1, endsAt: 1 });
