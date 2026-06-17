import { Schema } from 'mongoose';
import type { Subscription } from './subscription';
import { baseFields, opts } from '../../../../common';

const SubscriptionPlanLimitsSchema = new Schema(
  {
    users: { type: Number, required: true },
    branches: { type: Number, required: true },
    invoicesPerMonth: { type: Number, required: true },
    storageGB: { type: Number, required: true },
  },
  { _id: false },
);

const SubscriptionPlanSnapshotSchema = new Schema(
  {
    code: {
      type: String,
      enum: ['plus', 'basic', 'standard', 'advanced', 'premium', 'accounting'],
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    interval: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    limits: {
      type: SubscriptionPlanLimitsSchema,
      required: true,
    },
  },
  { _id: false },
);

export const SubscriptionSchemaMongo = new Schema<Subscription>(
  {
    ...baseFields,
    organizationId: {
      type: String,
      required: true,
      index: true,
    },

    plan: {
      type: SubscriptionPlanSnapshotSchema,
      required: true,
    },

    status: {
      type: String,
      enum: ['trialing', 'active', 'past_due', 'suspended', 'cancelled', 'expired'],
      required: true,
      default: 'trialing',
      index: true,
    },

    trialStartedAt: String,
    trialEndsAt: String,

    currentPeriodStartedAt: {
      type: String,
      required: true,
    },

    currentPeriodEndsAt: {
      type: String,
      required: true,
    },

    cancelledAt: String,
    suspendedAt: String,

    provider: {
      type: String,
      enum: ['manual', 'stripe', 'wompi', 'mercadopago'],
      default: 'manual',
    },

    providerSubscriptionId: String,

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    createdBy: {
      type: String,
      required: true,
    },

    updatedBy: {
      type: String,
    },
  },
  {
    ...opts,
  },
);

SubscriptionSchemaMongo.index({ organizationId: 1 }, { unique: true });
