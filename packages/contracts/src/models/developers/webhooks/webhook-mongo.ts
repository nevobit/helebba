import { Schema } from 'mongoose';
import { baseFields, opts } from '../../../common';
import { WEBHOOK_EVENT_NAMES, type WebhookDelivery, type WebhookSubscription } from './webhook';

export const WebhookSubscriptionSchemaMongo = new Schema<WebhookSubscription>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    events: [{ type: String, enum: WEBHOOK_EVENT_NAMES, required: true }],
    active: { type: Boolean, default: true, index: true },
    secret: { type: String, required: true, select: false },
    customHeaders: { type: Map, of: String, default: {} },
    failureCount: { type: Number, default: 0 },
    lastDeliveredAt: { type: Date },
    lastError: { type: String },
  },
  { ...opts },
);

WebhookSubscriptionSchemaMongo.index({ organizationId: 1, name: 1 });

export const WebhookDeliverySchemaMongo = new Schema<WebhookDelivery>(
  {
    ...baseFields,
    organizationId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    updatedBy: { type: String, required: true },
    deletedBy: { type: String },
    subscriptionId: { type: String, required: true, index: true },
    event: { type: String, enum: WEBHOOK_EVENT_NAMES, required: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'failed', 'retrying'],
      default: 'pending',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    responseStatus: { type: Number },
    responseBody: { type: String },
    error: { type: String },
    deliveredAt: { type: Date },
    nextRetryAt: { type: Date, index: true },
  },
  { ...opts },
);

WebhookDeliverySchemaMongo.index({ organizationId: 1, subscriptionId: 1, createdAt: -1 });
