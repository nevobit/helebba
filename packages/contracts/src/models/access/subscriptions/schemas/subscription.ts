import type {
  ISODateTimeString,
  PersistedEntity,
  SubscriptionId,
  UserId,
} from '../../../../common';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'suspended'
  | 'cancelled'
  | 'expired';
export type BillingInterval = 'monthly' | 'yearly';

export type PlanCode = 'plus' | 'basic' | 'standard' | 'advanced' | 'premium' | 'accounting';

export interface SubscriptionPlanLimits {
  users: number;
  branches: number;
  invoicesPerMonth: number;
  storageGB: number;
}

export interface SubscriptionPlanSnapshot {
  code: PlanCode;
  name: string;
  price: number;
  currency: string;
  interval: BillingInterval;
  limits: SubscriptionPlanLimits;
}

export interface Subscription extends PersistedEntity<SubscriptionId, UserId> {
  plan: SubscriptionPlanSnapshot;
  status: SubscriptionStatus;

  trialStartedAt?: ISODateTimeString;
  trialEndsAt?: ISODateTimeString;

  currentPeriodStartedAt: ISODateTimeString;
  currentPeriodEndsAt: ISODateTimeString;

  cancelledAt?: ISODateTimeString;
  suspendedAt?: ISODateTimeString;

  provider?: 'manual' | 'stripe' | 'wompi' | 'mercadopago';
  providerSubscriptionId?: string;

  metadata?: Record<string, unknown>;
}
